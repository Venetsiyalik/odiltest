import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { PDF_LOGO_YOLI } from "@/lib/pdf/logo-yoli";

const uslub = StyleSheet.create({
  sahifa: { fontFamily: "DejaVu Sans", fontSize: 10, padding: 32 },
  logoQatori: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  logotip: { width: 28, height: 28 },
  maktabNomi: { fontSize: 16, fontWeight: "bold" },
  sarlavha: { fontSize: 12, fontWeight: "bold", marginBottom: 2 },
  subSarlavha: { fontSize: 9, color: "#555", marginBottom: 16 },
  fanBlogi: { marginBottom: 14 },
  fanNomi: { fontSize: 11, fontWeight: "bold", marginBottom: 4 },
  sarlavhaQatori: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 4,
    marginBottom: 2,
    fontWeight: "bold",
  },
  qator: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    paddingVertical: 4,
  },
  ustunSana: { width: "25%" },
  ustunTest: { width: "40%" },
  ustunBall: { width: "15%" },
  ustunBaho: { width: "20%" },
  ortacha: { marginTop: 4, fontSize: 9, color: "#333" },
});

export interface OquvchiTabeliQatori {
  fanNomi: string;
  testNomi: string;
  sana: string;
  togriSoni: number | null;
  jamiSavol: number;
  ballFoiz: number | null;
  baho: number | null;
}

export interface OquvchiTabeliProps {
  maktabNomi: string;
  oquvchiIsmFamiliya: string;
  sinfNomi: string;
  sana: string;
  qatorlarFanBoyicha: Record<string, OquvchiTabeliQatori[]>;
}

export function OquvchiTabeliHisoboti({
  maktabNomi,
  oquvchiIsmFamiliya,
  sinfNomi,
  sana,
  qatorlarFanBoyicha,
}: OquvchiTabeliProps) {
  const fanlar = Object.keys(qatorlarFanBoyicha);

  return (
    <Document>
      <Page size="A4" style={uslub.sahifa}>
        <View style={uslub.logoQatori}>
          {/* @react-pdf/renderer'ning o'z Image komponenti — HTML/next/image
              emas, `alt` propi yo'q (jsx-a11y buni bilmaydi). */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={PDF_LOGO_YOLI} style={uslub.logotip} />
          <Text style={uslub.maktabNomi}>{maktabNomi}</Text>
        </View>
        <Text style={uslub.sarlavha}>
          {oquvchiIsmFamiliya} · {sinfNomi} sinf
        </Text>
        <Text style={uslub.subSarlavha}>Hisobot sanasi: {sana}</Text>

        {fanlar.length === 0 && <Text>Hali topshirilgan test yo&apos;q</Text>}

        {fanlar.map((fan) => {
          const qatorlar = qatorlarFanBoyicha[fan];
          const ortacha = Math.round(
            qatorlar.reduce((y, q) => y + (q.ballFoiz ?? 0), 0) / qatorlar.length,
          );

          return (
            <View key={fan} style={uslub.fanBlogi} wrap={false}>
              <Text style={uslub.fanNomi}>{fan}</Text>
              <View style={uslub.sarlavhaQatori}>
                <Text style={uslub.ustunSana}>Sana</Text>
                <Text style={uslub.ustunTest}>Test</Text>
                <Text style={uslub.ustunBall}>Ball</Text>
                <Text style={uslub.ustunBaho}>Baho</Text>
              </View>
              {qatorlar.map((q, indeks) => (
                <View key={indeks} style={uslub.qator}>
                  <Text style={uslub.ustunSana}>{q.sana}</Text>
                  <Text style={uslub.ustunTest}>{q.testNomi}</Text>
                  <Text style={uslub.ustunBall}>
                    {q.togriSoni ?? 0}/{q.jamiSavol}
                  </Text>
                  <Text style={uslub.ustunBaho}>{q.baho ?? "—"}</Text>
                </View>
              ))}
              <Text style={uslub.ortacha}>O&apos;rtacha: {ortacha}%</Text>
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
