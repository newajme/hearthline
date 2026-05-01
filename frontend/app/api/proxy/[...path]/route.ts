/**
 * Authenticated proxy from the browser to the Django API.
 *
 * Browsers can't send the Django sessionid cookie cross-origin in production,
 * but they CAN send the Next.js `hearthline_session` cookie. This route reads
 * that, forwards the request to Django with the matching `Cookie: sessionid=...`
 * header, and streams the response back.
 *
 * Use it from the client like: fetch("/api/proxy/quotes/", { method: "POST", body })
 */
import { NextRequest, NextResponse } from "next/server";

import { API_URL, SESSION_COOKIE } from "@/app/lib/api";

export const dynamic = "force-dynamic";

async function forward(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const tail = path.join("/");
  const search = request.nextUrl.search || "";
  const url = `${API_URL}/${tail}${tail.endsWith("/") ? "" : "/"}${search}`;

  const session = request.cookies.get(SESSION_COOKIE)?.value;

  const headers = new Headers();
  const ct = request.headers.get("content-type");
  if (ct) headers.set("Content-Type", ct);
  const accept = request.headers.get("accept");
  if (accept) headers.set("Accept", accept);
  if (session) headers.set("Cookie", `sessionid=${session}`);

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };
  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.text();
  }

  const upstream = await fetch(url, init);
  // 204 / 304 must not have a body — pass through directly.
  if (upstream.status === 204 || upstream.status === 304) {
    return new NextResponse(null, { status: upstream.status });
  }
  const body = await upstream.arrayBuffer();
  const res = new NextResponse(body, { status: upstream.status });
  const upstreamCT = upstream.headers.get("content-type");
  if (upstreamCT) res.headers.set("content-type", upstreamCT);
  return res;
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
