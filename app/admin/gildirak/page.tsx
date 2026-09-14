import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl } from "@/lib/auth/admin";
import { fanlarniOl, sinflarniOl, mavzularniOl } from "@/lib/actions/spravochniklar";
import { oquvchilarniOl, type Oquvchi } from "@/lib/actions/oquvchilar";
import { GildirakSozlash } from "@/components/admin/gildirak-sozlash";

export default async function GildirakSahifasi() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [fanlar, sinflar, mavzular, oquvchilar] = await Promise.all([
    fanlarniOl(),
    sinflarniOl(),
    mavzularniOl(),
    oquvchilarniOl(),
  ]);

  const oquvchilarSinfBoyicha: Record<number, Oquvchi[]> = {};
  for (const o of oquvchilar) {
    (oquvchilarSinfBoyicha[o.sinf_id] ??= []).push(o);
  }

  return (
    <GildirakSozlash
      sinflar={sinflar ?? []}
      fanlar={fanlar ?? []}
      mavzular={mavzular}
      oquvchilarSinfBoyicha={oquvchilarSinfBoyicha}
    />
  );
}
