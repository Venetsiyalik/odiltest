import { notFound } from "next/navigation";
import Link from "next/link";
import { darajaHaqiqiymi } from "@/lib/redizayn/daraja";
import { materialDetaliniOl } from "@/lib/redizayn/mavzu-sahifasi";
import { joriyOquvchiniOl } from "@/lib/auth/student";
import { youtubeEmbedUrl } from "@/lib/utils/youtube";
import { theme } from "@/lib/theme";
import { Karta } from "@/components/redizayn/karta";
import { HavolaTugma } from "@/components/redizayn/tugma";
import { KontentKorinish } from "@/components/kontent-korinish";
import { KorildiBelgilash } from "@/components/student/korildi-belgilash";
import { PrezentatsiyaOchuvchi } from "@/components/redizayn/prezentatsiya-ochuvchi";

export default async function MaterialSahifasi({
  params,
}: {
  params: Promise<{ daraja: string; fanId: string; mavzuId: string; materialId: string }>;
}) {
  const { daraja, fanId, mavzuId, materialId } = await params;
  const darajaRaqami = Number(daraja);
  const fanIdRaqami = Number(fanId);
  const mavzuIdRaqami = Number(mavzuId);
  const materialIdRaqami = Number(materialId);
  if (
    !Number.isInteger(darajaRaqami) ||
    !darajaHaqiqiymi(darajaRaqami) ||
    !Number.isInteger(fanIdRaqami) ||
    !Number.isInteger(mavzuIdRaqami) ||
    !Number.isInteger(materialIdRaqami)
  ) {
    notFound();
  }

  const material = await materialDetaliniOl(materialIdRaqami);
  if (!material || material.mavzuId !== mavzuIdRaqami) notFound();

  const oquvchi = await joriyOquvchiniOl();
  const orqagaHref = `/sinf/${darajaRaqami}/${fanIdRaqami}/${mavzuIdRaqami}`;
  const embedUrl = material.turi === "video" && material.tashqiUrl ? youtubeEmbedUrl(material.tashqiUrl) : null;

  return (
    <main
      className="min-h-screen"
      style={{
        background: theme.colors.bg,
        backgroundImage: "url(/naqsh.svg)",
        backgroundRepeat: "repeat",
        color: theme.colors.text,
        fontFamily: "var(--font-nunito), sans-serif",
      }}
    >
      {oquvchi && <KorildiBelgilash materialId={material.id} />}

      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6 pb-16 sm:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-extrabold sm:text-[36px]" style={{ color: theme.colors.primary }}>
            {material.sarlavha}
          </h1>
          <Link href={orqagaHref} className="shrink-0 text-[16px] underline" style={{ color: theme.colors.muted }}>
            Mavzuga qaytish
          </Link>
        </div>

        {material.turi === "maruza" && (
          <Karta>
            <KontentKorinish matn={material.kontent ?? ""} />
          </Karta>
        )}

        {material.turi === "video" && (
          <Karta className="p-0">
            {embedUrl ? (
              <div className="aspect-video w-full overflow-hidden" style={{ borderRadius: theme.radius.lg }}>
                <iframe
                  src={`${embedUrl}?modestbranding=1&rel=0`}
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="p-5" style={{ color: theme.colors.muted }}>
                Video havolasi topilmadi
              </p>
            )}
          </Karta>
        )}

        {material.turi === "prezentatsiya" && (
          <Karta className="flex flex-col items-center gap-4 py-10 text-center">
            <span className="text-5xl">📊</span>
            {material.faylUrl ? (
              <PrezentatsiyaOchuvchi faylUrl={material.faylUrl} sarlavha={material.sarlavha} />
            ) : (
              <p style={{ color: theme.colors.muted }}>Fayl topilmadi</p>
            )}
          </Karta>
        )}

        {material.turi === "fayl" && (
          <Karta className="flex flex-col items-center gap-4 py-10 text-center">
            <span className="text-5xl">📎</span>
            {material.faylUrl && (
              <HavolaTugma href={material.faylUrl} rang="accent">
                Faylni yuklab olish
              </HavolaTugma>
            )}
          </Karta>
        )}
      </div>
    </main>
  );
}
