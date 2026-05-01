import { NextResponse } from "next/server";

import { API_URL, SESSION_COOKIE, extractSessionId } from "@/app/lib/api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = (body.username ?? body.email ?? "").trim();
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json({ detail: "Email and password are required." }, { status: 400 });
  }

  const upstream = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const sessionid = extractSessionId(upstream.headers.get("set-cookie"));
  const res = NextResponse.json(data);
  if (sessionid) {
    res.cookies.set({
      name: SESSION_COOKIE,
      value: sessionid,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }
  return res;
}
