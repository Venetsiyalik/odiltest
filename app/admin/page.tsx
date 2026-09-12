import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";

export default async function AdminIndexPage() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  redirect(foydalanuvchi ? "/dashboard" : "/kirish");
}
