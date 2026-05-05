"""AI service layer.

One pipeline:
  - extract_lead_from_transcript — turns a call transcript into structured lead data.

Uses Anthropic Claude as the default orchestrator with OpenAI as the
configurable fallback (per-business llm_provider).
"""
from __future__ import annotations

import json
import logging
from typing import Any

from django.conf import settings

logger = logging.getLogger(__name__)


CLAUDE_MODEL = "claude-sonnet-4-6"
OPENAI_TEXT_MODEL = "gpt-4o"


def _resolve_business():
    """Get the active business — single-tenant for now, first row wins."""
    from apps.core.models import Business
    return Business.objects.first()


def _claude_client(business=None):
    biz = business or _resolve_business()
    key = (biz.resolved_anthropic_key if biz else "") or settings.ANTHROPIC_API_KEY
    if not key:
        return None
    try:
        import anthropic  # noqa: WPS433
    except ImportError:
        logger.warning("anthropic SDK not installed")
        return None
    return anthropic.Anthropic(api_key=key)


def _openai_client(business=None):
    biz = business or _resolve_business()
    key = (biz.resolved_openai_key if biz else "") or settings.OPENAI_API_KEY
    if not key:
        return None
    try:
        import openai  # noqa: WPS433
    except ImportError:
        logger.warning("openai SDK not installed")
        return None
    return openai.OpenAI(api_key=key)


# ---------------------------------------------------------------------------
# 1. Transcript → structured lead
# ---------------------------------------------------------------------------

EXTRACTION_PROMPT = """You are the operations assistant for a home-services business.
Read the call transcript and return a strict JSON object with these keys:

  customer_name      string (best guess, "" if unknown)
  customer_email     string ("" if not given)
  address            string ("" if not given)
  project_summary    string, ≤ 280 chars, plain English
  trade              one of: hvac, plumbing, windows, doors, roofing, solar, renovation, other
  urgency            one of: emergency, this_week, this_month, planning
  temperature        one of: hot, warm, cold
  estimated_value    number, USD, your best honest guess based on the work described, or null
  follow_up_actions  array of strings, max 3 items

Return ONLY the JSON object. No prose, no code fences."""


def extract_lead_from_transcript(transcript: str, business=None) -> dict[str, Any]:
    """Run the configured LLM over the transcript and return structured lead data.

    Dispatches to OpenAI or Claude based on `business.llm_provider`. Falls back
    to an empty stub when no API key is configured so the rest of the pipeline
    keeps working in local dev.
    """
    if not transcript.strip():
        return _empty_extract()

    biz = business or _resolve_business()
    provider = (getattr(biz, "llm_provider", "") or "anthropic").lower()
    kb = (biz.knowledge_base if biz else "") or ""
    system = EXTRACTION_PROMPT
    if kb:
        system += "\n\nBusiness knowledge base:\n" + kb[:4000]

    if provider == "openai":
        oai = _openai_client(biz)
        if not oai:
            logger.info("OPENAI_API_KEY missing — returning stub lead extract")
            return _empty_extract()
        try:
            resp = oai.chat.completions.create(
                model=OPENAI_TEXT_MODEL,
                max_tokens=1024,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": transcript[:16000]},
                ],
            )
            content = resp.choices[0].message.content or ""
            return json.loads(_strip_fences(content))
        except Exception as exc:  # noqa: BLE001
            logger.warning("OpenAI lead extract failed: %s", exc)
            return _empty_extract()

    client = _claude_client(biz)
    if not client:
        logger.info("ANTHROPIC_API_KEY missing — returning stub lead extract")
        return _empty_extract()

    msg = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=1024,
        system=system,
        messages=[{"role": "user", "content": transcript[:16000]}],
    )

    text = "".join(block.text for block in msg.content if hasattr(block, "text"))
    try:
        return json.loads(_strip_fences(text))
    except json.JSONDecodeError:
        logger.warning("Claude returned non-JSON: %s", text[:200])
        return _empty_extract()


def _empty_extract() -> dict[str, Any]:
    return {
        "customer_name": "",
        "customer_email": "",
        "address": "",
        "project_summary": "",
        "trade": "other",
        "urgency": "planning",
        "temperature": "warm",
        "estimated_value": None,
        "follow_up_actions": [],
    }


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def _strip_fences(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        t = t.lstrip("`")
        # drop optional language tag like "json"
        if "\n" in t:
            t = t.split("\n", 1)[1]
        if t.endswith("```"):
            t = t[:-3]
    return t.strip()


