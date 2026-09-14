import { redirect } from "next/navigation";
import { joriyFoydalanuvchiniOl, joriyKirishDoirasiniOl } from "@/lib/auth/admin";
import { fanlarniOl, mavzularniOl, sinflarniOl } from "@/lib/actions/spravochniklar";
import { SmartTestSozlash } from "@/components/admin/smart-test-sozlash";
import { doiraBoyichaFiltrlash } from "@/lib/utils/select-items";
import { sinfDarajasi } from "@/lib/redizayn/daraja";

export default async function SmartTestSahifasi() {
  const foydalanuvchi = await joriyFoydalanuvchiniOl();
  if (!foydalanuvchi) redirect("/kirish");

  const [xomFanlar, mavzular, sinflar, doira] = await Promise.all([
    fanlarniOl(),
    mavzularniOl(),
    sinflarniOl(),
    joriyKirishDoirasiniOl(),
  ]);
  const fanlar = doiraBoyichaFiltrlash(xomFanlar ?? [], doira.fanlar, doira.cheklanganmi);
  const ruxsatEtilganDarajalar = doira.cheklanganmi
    ? Array.from(
        new Set(
          (sinflar ?? [])
            .filter((s) => doira.sinflar.includes(s.id))
            .map((s) => sinfDarajasi(s.nomi))
            .filter((d): d is number => d !== null),
        ),
      )
    : undefined;

  return (
    <SmartTestSozlash
      fanlar={fanlar}
      mavzular={mavzular}
      ruxsatEtilganDarajalar={ruxsatEtilganDarajalar}
    />
  );
}
