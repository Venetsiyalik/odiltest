import { TezOrada } from "@/components/student/tez-orada";
import { joriyMatnlarniOlish } from "@/lib/i18n/joriy-til";

export default async function NatijalarimPage() {
  const matnlar = await joriyMatnlarniOlish();
  return <TezOrada boUlim={matnlar.talaba.menyu.natijalarim} />;
}
