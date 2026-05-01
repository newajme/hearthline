"""DRF authentication that uses the Django session but skips CSRF.

The Hearthline API is reached only through the Next.js server-side proxy
(`/api/proxy/...`), which forwards the httpOnly session cookie. Browsers
never call the Django API directly, so DRF's default CSRF check (designed
for browser-issued unsafe requests) is redundant and blocks legitimate
PATCH/POST traffic from the proxy.
"""
from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):  # noqa: ARG002
        return None
