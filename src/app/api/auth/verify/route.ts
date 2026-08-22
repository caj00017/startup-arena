import { NextResponse } from "next/server";
import { consumeMagicLink } from "@/lib/auth";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const next = url.searchParams.get("next") || "/";
  if (!token || !(await consumeMagicLink(token))) {
    return NextResponse.redirect(new URL("/signin?error=expired", env.NEXT_PUBLIC_APP_URL));
  }
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return NextResponse.redirect(new URL(destination, env.NEXT_PUBLIC_APP_URL));
}
