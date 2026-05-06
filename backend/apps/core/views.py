import hmac
import io
import os
from io import StringIO

from django.core.management import call_command
from django.db import connection
from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Business, Channel
from .serializers import BusinessSerializer, ChannelSerializer

MAX_UPLOAD_BYTES = 5 * 1024 * 1024
ALLOWED_EXTS = (".txt", ".md", ".markdown", ".pdf")


class BusinessListCreate(generics.ListCreateAPIView):
    queryset = Business.objects.all().order_by("-created_at")
    serializer_class = BusinessSerializer
    permission_classes = [IsAuthenticated]


class BusinessDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Business.objects.all()
    serializer_class = BusinessSerializer
    permission_classes = [IsAuthenticated]


# Whitelist of fields the reveal endpoint will return in plaintext. Avoid
# adding non-secret CharFields here — they're already returned by the regular
# serializer.
REVEALABLE_FIELDS = {
    "anthropic_api_key", "openai_api_key", "vapi_api_key", "vapi_phone_number_id",
    "twilio_account_sid", "twilio_auth_token", "whatsapp_access_token",
    "whatsapp_verify_token",
}


class RevealKeyView(APIView):
    """Return the decrypted plaintext of a single saved credential.

    Only authenticated staff users. Logs every reveal so the action is
    auditable. The regular Business serializer NEVER ships plaintext to the
    browser — this endpoint is the only path, and it's POST-only so it can't
    be triggered by a stray <img> or link.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk: int):
        if not (request.user and request.user.is_staff):
            return Response({"detail": "Staff only."}, status=status.HTTP_403_FORBIDDEN)
        field = (request.data.get("field") or "").strip()
        if field not in REVEALABLE_FIELDS:
            return Response({"detail": "Unknown or non-revealable field."}, status=status.HTTP_400_BAD_REQUEST)
        business = Business.objects.filter(pk=pk).first()
        if business is None:
            return Response({"detail": "Business not found."}, status=status.HTTP_404_NOT_FOUND)
        plaintext = (getattr(business, field, "") or "").strip()
        import logging
        logging.getLogger(__name__).info(
            "[REVEAL] user=%s biz=%s field=%s len=%d",
            request.user.username, business.pk, field, len(plaintext),
        )
        return Response({"value": plaintext})


class ChannelListCreate(generics.ListCreateAPIView):
    """List/create channels — accepts ?business=<id> filter."""
    serializer_class = ChannelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Channel.objects.all().order_by("kind")
        biz = self.request.query_params.get("business")
        if biz:
            qs = qs.filter(business_id=biz)
        return qs

    def perform_create(self, serializer):
        # Channel needs a business; default to first if not provided.
        business_id = self.request.data.get("business")
        if business_id:
            business = Business.objects.filter(pk=business_id).first()
        else:
            business = Business.objects.first()
        serializer.save(business=business)


class ChannelDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Channel.objects.all()
    serializer_class = ChannelSerializer
    permission_classes = [IsAuthenticated]


class KnowledgeUploadView(APIView):
    """Extract text from an uploaded document and append it to the business's knowledge_base."""

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk: int):
        business = Business.objects.filter(pk=pk).first()
        if business is None:
            return Response({"detail": "Business not found."}, status=status.HTTP_404_NOT_FOUND)

        upload = request.FILES.get("file")
        if upload is None:
            return Response({"detail": "Missing 'file' field."}, status=status.HTTP_400_BAD_REQUEST)
        if upload.size > MAX_UPLOAD_BYTES:
            return Response(
                {"detail": f"File too large (max {MAX_UPLOAD_BYTES // 1024 // 1024} MB)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        name = (upload.name or "document").strip()
        ext = "." + name.rsplit(".", 1)[-1].lower() if "." in name else ""
        if ext not in ALLOWED_EXTS:
            return Response(
                {"detail": f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTS)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        raw = upload.read()
        try:
            if ext == ".pdf":
                text = _extract_pdf(raw)
            else:
                text = raw.decode("utf-8", errors="replace")
        except Exception as exc:
            return Response({"detail": f"Failed to read document: {exc}"}, status=status.HTTP_400_BAD_REQUEST)

        text = text.strip()
        if not text:
            return Response({"detail": "Document had no extractable text."}, status=status.HTTP_400_BAD_REQUEST)

        header = f"\n\n--- {name} ---\n"
        existing = business.knowledge_base or ""
        business.knowledge_base = (existing + header + text).strip()
        business.save(update_fields=["knowledge_base", "updated_at"])

        return Response({
            "ok": True,
            "filename": name,
            "characters_added": len(text),
            "knowledge_base": business.knowledge_base,
        })


def _extract_pdf(raw: bytes) -> str:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(raw))
    return "\n\n".join((page.extract_text() or "") for page in reader.pages)


class MigrateView(APIView):
    """Run Django migrations against the live database.

    Guarded by MIGRATE_SECRET_TOKEN env var (sent as `?token=` or
    `X-Migrate-Token` header). Returns the migrate command output and the
    list of applied migrations after the run.
    """

    permission_classes = [AllowAny]
    authentication_classes: list = []

    def post(self, request):
        expected = os.environ.get("MIGRATE_SECRET_TOKEN", "")
        if not expected:
            return Response(
                {"detail": "MIGRATE_SECRET_TOKEN is not configured on the server."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        provided = request.headers.get("X-Migrate-Token") or request.query_params.get("token") or ""
        if not hmac.compare_digest(provided, expected):
            return Response({"detail": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED)

        out = StringIO()
        try:
            call_command("migrate", "--noinput", stdout=out, stderr=out)
        except Exception as exc:
            return Response(
                {"ok": False, "error": str(exc), "output": out.getvalue()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        applied = []
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT app, name FROM django_migrations ORDER BY app, id"
            )
            applied = [{"app": row[0], "name": row[1]} for row in cursor.fetchall()]

        return Response({"ok": True, "output": out.getvalue(), "applied": applied})
