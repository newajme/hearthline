"""Seed Hearthline with believable demo data so the dashboard isn't empty.

Usage:
    docker compose exec backend python manage.py seed_demo
    docker compose exec backend python manage.py seed_demo --wipe
"""
from __future__ import annotations

import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.calls.models import Call
from apps.core.models import Business, Channel
from apps.leads.models import Conversation, Customer, Lead, Message
from apps.quotes.models import LineItem, Quote


CUSTOMERS = [
    ("Demo Customer", "+1 (000) 123-4567", "demo@example.test", "123 Demo Street, Sample City"),
]


LEADS = [
    {
        "summary": "Sample window replacement enquiry — 3 standard PVC units.",
        "status": "quoted",
        "temp": "warm",
        "value": 1900,
        "extracted": {"trade": "windows", "units": 3, "material": "white PVC", "urgency": "this_month"},
    },
]


CALLS = [
    {
        "from": "+10001234567",
        "transcript": "Hi, this is a demo caller. I'd like a quote on three standard PVC windows.",
        "summary": "Demo call — sample window replacement enquiry for 3 units.",
        "status": "completed",
        "duration": 120,
    },
]


QUOTES = [
    {
        "ref": "HL-DEMO01",
        "lead_idx": 0,
        "items": [
            ("Standard PVC window 1.2m × 1.4m", 3, 580),
            ("Removal & disposal of existing units", 3, 60),
            ("Site survey + measurement", 1, 150),
        ],
        "notes": "Demo quote for screen recording. Not a real customer.",
        "status": "sent",
    },
]


class Command(BaseCommand):
    help = "Seed Hearthline with believable demo data."

    def add_arguments(self, parser):
        parser.add_argument("--wipe", action="store_true", help="Delete ALL existing data first.")
        parser.add_argument(
            "--noinput", "--no-input", action="store_true",
            help="Skip the interactive confirmation prompt for --wipe (use in CI).",
        )

    def handle(self, *args, **opts):
        if opts.get("wipe"):
            existing = (
                Business.objects.count() + Customer.objects.count()
                + Lead.objects.count() + Quote.objects.count() + Call.objects.count()
            )
            if existing and not opts.get("noinput"):
                self.stdout.write(self.style.WARNING(
                    f"--wipe will delete {existing} rows across Business/Customer/Lead/"
                    "Quote/Call/Channel. This is NOT reversible."
                ))
                answer = input("Type 'wipe' to continue: ").strip().lower()
                if answer != "wipe":
                    self.stdout.write(self.style.ERROR("Aborted."))
                    return
            self.stdout.write("Wiping…")
            Call.objects.all().delete()
            Quote.objects.all().delete()
            Lead.objects.all().delete()
            Customer.objects.all().delete()
            Channel.objects.all().delete()
            Business.objects.all().delete()

        biz, biz_created = Business.objects.get_or_create(
            slug="rolling-shutters-inc",
            defaults={
                "name": "Rolling Shutters Inc.",
                "trade": "windows",
                "timezone": "America/Los_Angeles",
                "phone_number": "+1 (555) 010-1010",
                "voice_persona": "Anna",
                "knowledge_base": (
                    "Standard PVC window: $580 / unit. Wood: $880 / unit. Roofing: $3.60 / sqft asphalt, "
                    "$7.50 / sqft tile. HVAC: 16 SEER 3-ton units start at $8,500 + install. "
                    "Service area: SF Bay Area. Same-week emergency: yes."
                ),
            },
        )
        self.stdout.write(f"  Business: {biz.name} ({'new' if biz_created else 'existing'})")

        # channels: intentionally not seeded — operators add their own from Settings.
        self.stdout.write(f"  Channels: {biz.channels.count()} (none seeded by default)")

        # customers
        customer_objs: list[Customer] = []
        for name, phone, email, addr in CUSTOMERS:
            c, _ = Customer.objects.update_or_create(
                business=biz,
                phone=phone,
                defaults={"name": name, "email": email, "address": addr},
            )
            customer_objs.append(c)
        self.stdout.write(f"  Customers: {len(customer_objs)}")

        # leads
        now = timezone.now()
        lead_objs: list[Lead] = []
        for i, spec in enumerate(LEADS):
            cust = customer_objs[i % len(customer_objs)]
            lead = Lead.objects.create(
                business=biz,
                customer=cust,
                project_summary=spec["summary"],
                status=spec["status"],
                temperature=spec["temp"],
                estimated_value=Decimal(str(spec["value"])) if spec["value"] is not None else None,
                extracted_fields=spec["extracted"],
            )
            # backdate the created_at so the dashboard shows a spread of "X min/h ago"
            offset_min = i * 7 + random.randint(1, 5)
            Lead.objects.filter(pk=lead.pk).update(
                created_at=now - timedelta(minutes=offset_min),
                updated_at=now - timedelta(minutes=offset_min),
            )
            lead.refresh_from_db()
            lead_objs.append(lead)

            # one conversation + one inbound message per lead
            convo = Conversation.objects.create(lead=lead)
            Message.objects.create(
                conversation=convo,
                direction="in",
                role="customer",
                body=spec["summary"],
            )
        self.stdout.write(f"  Leads: {len(lead_objs)}")

        # calls
        for i, c in enumerate(CALLS):
            lead = lead_objs[i] if i < len(lead_objs) else None
            call = Call.objects.create(
                business=biz,
                lead=lead,
                provider="vapi",
                provider_call_id=f"demo_call_{i + 1:04d}",
                from_number=c["from"],
                to_number="+15550101010",
                status=c["status"],
                duration_seconds=c["duration"] or None,
                transcript=c["transcript"],
                summary=c["summary"],
                raw_payload={"demo": True},
            )
            Call.objects.filter(pk=call.pk).update(
                started_at=now - timedelta(minutes=i * 11 + 3),
                ended_at=now - timedelta(minutes=i * 11 + 1),
            )
        self.stdout.write(f"  Calls: {len(CALLS)}")

        # quotes
        for q in QUOTES:
            lead = lead_objs[q["lead_idx"]]
            subtotal = Decimal("0")
            quote = Quote.objects.create(
                lead=lead,
                reference=q["ref"],
                subtotal=Decimal("0"),
                tax=Decimal("0"),
                total=Decimal("0"),
                notes=q["notes"],
                status=q["status"],
                drafted_by_ai=True,
                photo_assessment={
                    "trade": lead.extracted_fields.get("trade"),
                    "scope_summary": lead.project_summary,
                    "source_photo": "https://example.com/demo-photo.jpg",
                },
            )
            for desc, qty, unit in q["items"]:
                line_total = Decimal(qty) * Decimal(unit)
                LineItem.objects.create(
                    quote=quote,
                    description=desc,
                    quantity=Decimal(qty),
                    unit_price=Decimal(unit),
                    total=line_total,
                )
                subtotal += line_total
            tax = (subtotal * Decimal("0.08")).quantize(Decimal("0.01"))
            quote.subtotal = subtotal
            quote.tax = tax
            quote.total = subtotal + tax
            quote.save(update_fields=["subtotal", "tax", "total"])
        self.stdout.write(f"  Quotes: {len(QUOTES)}")

        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
