import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(error: unknown, fallback = "The request could not be completed.") {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message || "Invalid request." }, { status: 400 });
  }
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized() {
  return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "You do not have permission to do that." }, { status: 403 });
}
