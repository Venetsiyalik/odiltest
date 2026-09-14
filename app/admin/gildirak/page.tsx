import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl, joriyKirishDoirasiniOl } from "@/lib/auth/admin";
import { fanlarniOl, sinflarniOl, mavzularniOl } from "@/lib/actions/spravochniklar";
import { oquvchilarniOl, type Oquvchi } from "@/lib/actions/oquvchilar";
import { GildirakSozlash } from "@/components/admin/gildirak-sozlash";
import { doiraBoyichaFiltrlash } from "@/lib/utils/select-items";

export default async function GildirakSahifasi() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [xomFanlar, xomSinflar, mavzular, oquvchilar, doira] = await Promise.all([
    fanlarniOl(),
    sinflarniOl(),
    mavzularniOl(),
    oquvchilarniOl(),
    joriyKirishDoirasiniOl(),
  ]);
  const fanlar = doiraBoyichaFiltrlash(xomFanlar ?? [], doira.fanlar, doira.cheklanganmi);
  const sinflar = doiraBoyichaFiltrlash(xomSinflar ?? [], doira.sinflar, doira.cheklanganmi);

  const oquvchilarSinfBoyicha: Record<number, Oquvchi[]> = {};
  for (const o of oquvchilar) {
    (oquvchilarSinfBoyicha[o.sinf_id] ??= []).push(o);
  }

  return (
    <GildirakSozlash
      sinflar={sinflar}
      fanlar={fanlar}
      mavzular={mavzular}
      oquvchilarSinfBoyicha={oquvchilarSinfBoyicha}
    />
  );
}
