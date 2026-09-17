import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { StaleWriteError } from "@/lib/spine/types";

export function errorResponse(e: unknown): NextResponse {
  if (e instanceof StaleWriteError) {
    return NextResponse.json({ error: e.message, current: e.current }, { status: 409 });
  }
  if (e instanceof ZodError) {
    return NextResponse.json({ error: "invalid input", issues: e.issues }, { status: 400 });
  }
  if (e && typeof e === "object" && (e as { name?: string }).name === "ZodError") {
    return NextResponse.json({ error: "invalid input", issues: (e as { issues?: unknown }).issues }, { status: 400 });
  }
  if (e instanceof Error) {
    const message = e.message;
    if (message.startsWith("cannot move") || message.startsWith("already decided") || message.startsWith("invalid")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (message.endsWith("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
  console.error(e);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function json<T>(req: NextRequest): Promise<T> {
  return (await req.json()) as T;
}

