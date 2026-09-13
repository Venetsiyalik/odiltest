import { uz } from "@/lib/i18n/uz";
import { theme } from "@/lib/theme";
import { Karta } from "@/components/redizayn/karta";
import { Sherbek, type SherbekHolati } from "@/components/redizayn/sherbek";
import { HavolaTugma } from "@/components/redizayn/tugma";

function sherbekHolatiniTanlash(baho: number): SherbekHolati {
  if (baho >= 5) return "zor";
  if (baho >= 4) return "tugri";
  if (baho >= 3) return "oddiy";
  return "maslahat";
}

export function TestNatijasi({
  natijaKorsat,
  togriSoni,
  jamiSavol,
  ballFoiz,
  baho,
  vaqtTugaganmi,
}: {
  natijaKorsat: boolean;
  togriSoni: number;
  jamiSavol: number;
  ballFoiz: number;
  baho: number;
  vaqtTugaganmi: boolean;
}) {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-6"
      style={{
        background: theme.colors.bg,
        backgroundImage: "url(/naqsh.svg)",
        backgroundRepeat: "repeat",
        color: theme.colors.text,
        fontFamily: "var(--font-nunito), sans-serif",
      }}
    >
      <Karta className="flex max-w-md flex-col items-center gap-4 p-10 text-center">
        {vaqtTugaganmi && (
          <p className="text-[18px] font-semibold" style={{ color: theme.colors.danger }}>
            {uz.talaba.test.vaqtTugadi}
          </p>
        )}

        {natijaKorsat ? (
          <>
            <Sherbek holat={sherbekHolatiniTanlash(baho)} size="lg" />
            <p className="text-[56px] font-extrabold" style={{ color: theme.colors.primary }}>
              {togriSoni}/{jamiSavol}
            </p>
            <p className="text-[24px]" style={{ color: theme.colors.muted }}>
              {ballFoiz}% · baho {baho}
            </p>
          </>
        ) : (
          <>
            <Sherbek holat="oddiy" size="lg" />
            <p className="max-w-md text-[20px]">{uz.talaba.test.natijaQabulQilindi}</p>
          </>
        )}

        <HavolaTugma href="/menyu" rang="accent" className="mt-2">
          {uz.talaba.test.menyugaQaytish}
        </HavolaTugma>
      </Karta>
    </main>
  );
}
