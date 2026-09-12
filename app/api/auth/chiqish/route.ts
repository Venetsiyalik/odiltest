import { NextResponse } from "next/server";
import { sessiyaniTugatish } from "@/lib/auth/student";

export async function POST() {
  await sessiyaniTugatish();
  return NextResponse.json({ ok: true });
}
