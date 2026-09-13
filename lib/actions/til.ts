"use server";

import { cookies } from "next/headers";
import { TIL_COOKIE, type Til } from "@/lib/i18n/joriy-til";

const YIL_SONIYA = 60 * 60 * 24 * 365;

/** Talaba tomoni til tanlovini brauzerda (cookie) saqlaydi. */
export async function tilniOzgartirish(til: Til): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TIL_COOKIE, til, {
    path: "/",
    sameSite: "lax",
    maxAge: YIL_SONIYA,
  });
}
