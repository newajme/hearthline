"""Vercel Python entrypoint — exposes Django's WSGI app for serverless deploys.

Vercel imports `app` from this file and calls it as a WSGI handler. Anything
Django needs at boot (settings module, sys.path) gets set up here.
"""
import os
import sys

# Make the backend root importable so `hearthline.wsgi` resolves
HERE = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.dirname(HERE)
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hearthline.settings")

from hearthline.wsgi import application as app  # noqa: E402,F401  (Vercel imports `app`)
