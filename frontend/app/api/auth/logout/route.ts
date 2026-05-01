import { NextResponse } from "next/server";

import { API_URL, SESSION_COOKIE } from "@/app/lib/api";
import { cookies } from "next/headers";

export async function POST() {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (session) {
    await fetch(`${API_URL}/auth/logout/`, {
      method: "POST",
      headers: { Cookie: `sessionid=${session}` },
      cache: "no-store",
    }).catch(() => null);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
