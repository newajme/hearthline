/**
 * Server-side helper for talking to the Django API.
 *
 * The Next.js server holds a `hearthline_session` cookie (the Django sessionid
 * captured at login). We forward it as `Cookie: sessionid=...` so Django sees an
 * authenticated request. This works across separate frontend/backend domains.
 */
import { cookies } from "next/headers";

export const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api";

export const SESSION_COOKIE = "hearthline_session";

/**
 * Build a URL into the Django admin. Prefers explicit NEXT_PUBLIC_ADMIN_URL;
 * otherwise derives the origin from NEXT_PUBLIC_API_URL by stripping `/api`.
 * Pass a path like "/leads/lead/add/" — leading slash optional.
 */
export function getAdminUrl(path: string = ""): string {
  const explicit = process.env.NEXT_PUBLIC_ADMIN_URL;
  let base: string;
  if (explicit) {
    base = explicit.replace(/\/+$/, "");
  } else {
    const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
    try {
      const u = new URL(api);
      base = `${u.origin}/admin`;
    } catch {
      base = "http://localhost:8000/admin";
    }
  }
  if (!path) return `${base}/`;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const store = await cookies();
  const session = store.get(SESSION_COOKIE)?.value;
  const headers = new Headers(init.headers);
  if (session) {
    headers.set("Cookie", `sessionid=${session}`);
  }
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function apiJson<T>(path: string): Promise<T | null> {
  try {
    const res = await apiFetch(path);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type SessionUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  is_staff: boolean;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const res = await apiFetch("/auth/me/");
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.user as SessionUser) ?? null;
  } catch {
    // Backend unreachable — treat as signed-out so the auth gate can redirect cleanly.
    return null;
  }
}

/** Pull the `sessionid=...` value out of an upstream Set-Cookie header. */
export function extractSessionId(setCookie: string | null): string | null {
  if (!setCookie) return null;
  const match = setCookie.match(/sessionid=([^;]+)/i);
  return match ? match[1] : null;
}
