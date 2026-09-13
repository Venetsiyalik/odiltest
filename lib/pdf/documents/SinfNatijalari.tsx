import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const uslub = StyleSheet.create({
  sahifa: { fontFamily: "DejaVu Sans", fontSize: 10, padding: 32 },
  maktabNomi: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  sarlavha: { fontSize: 11, marginBottom: 2 },
  subSarlavha: { fontSize: 9, color: "#555", marginBottom: 16 },
  jadval: { display: "flex", flexDirection: "column", marginBottom: 16 },
  qator: { display: "flex", flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#ccc", paddingVertical: 4 },
  sarlavhaQatori: { display: "flex", flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000", paddingBottom: 4, marginBottom: 2, fontWeight: "bold" },
  ustunRaqam: { width: "6%" },
  ustunIsm: { width: "34%" },
  ustunBall: { width: "15%" },
  ustunFoiz: { width: "15%" },
  ustunBaho: { width: "15%" },
  ustunVaqt: { width: "15%" },
  xulosa: { marginTop: 8, marginBottom: 16, fontSize: 10 },
  qiyinSarlavha: { fontSize: 11, fontWeight: "bold", marginBottom: 6 },
  qiyinQator: { fontSize: 9, marginBottom: 3 },
});

export interface SinfNatijalariQatori {
  ismFamiliya: string;
  togriSoni: number | null;
  jamiSavol: number;
  ballFoiz: number | null;
  baho: number | null;
  vaqtDaqiqa: number | null;
}

export interface SinfNatijalariProps {
  maktabNomi: string;
  fanNomi: string;
  sinfNomi: string;
  testNomi: string;
  sana: string;
  oqituvchiIsmi: string;
  qatorlar: SinfNatijalariQatori[];
  qiyinSavollar: { matn: string; togriFoiz: number }[];
}

export function SinfNatijalariHisoboti({
  maktabNomi,
  fanNomi,
  sinfNomi,
  testNomi,
  sana,
  oqituvchiIsmi,
  qatorlar,
  qiyinSavollar,
}: SinfNatijalariProps) {
  const ortachaFoiz =
    qatorlar.length > 0
      ? Math.round(qatorlar.reduce((y, q) => y + (q.ballFoiz ?? 0), 0) / qatorlar.length)
      : 0;
  const aLo = qatorlar.filter((q) => q.baho === 5).length;
  const yaxshi = qatorlar.filter((q) => q.baho === 4).length;
  const qoniqarli = qatorlar.filter((q) => q.baho === 3).length;
  const yomon = qatorlar.filter((q) => q.baho === 2).length;

  return (
    <Document>
      <Page size="A4" style={uslub.sahifa}>
        <Text style={uslub.maktabNomi}>{maktabNomi}</Text>
        <Text style={uslub.sarlavha}>
          {fanNomi} fani · {sinfNomi} sinf · &quot;{testNomi}&quot;
        </Text>
        <Text style={uslub.subSarlavha}>
          Sana: {sana} · O&apos;qituvchi: {oqituvchiIsmi}
        </Text>

        <View style={uslub.jadval}>
          <View style={uslub.sarlavhaQatori}>
            <Text style={uslub.ustunRaqam}>№</Text>
            <Text style={uslub.ustunIsm}>F.I.Sh.</Text>
            <Text style={uslub.ustunBall}>Ball</Text>
            <Text style={uslub.ustunFoiz}>Foiz</Text>
            <Text style={uslub.ustunBaho}>Baho</Text>
            <Text style={uslub.ustunVaqt}>Vaqt</Text>
          </View>
          {qatorlar.map((q, indeks) => (
            <View key={indeks} style={uslub.qator}>
              <Text style={uslub.ustunRaqam}>{indeks + 1}</Text>
              <Text style={uslub.ustunIsm}>{q.ismFamiliya}</Text>
              <Text style={uslub.ustunBall}>
                {q.togriSoni ?? 0}/{q.jamiSavol}
              </Text>
              <Text style={uslub.ustunFoiz}>{Math.round(q.ballFoiz ?? 0)}%</Text>
              <Text style={uslub.ustunBaho}>{q.baho ?? "—"}</Text>
              <Text style={uslub.ustunVaqt}>
                {q.vaqtDaqiqa != null ? `${q.vaqtDaqiqa} daq` : "—"}
              </Text>
            </View>
          ))}
        </View>

        <Text style={uslub.xulosa}>
          Sinf o&apos;rtachasi: {ortachaFoiz}% · A&apos;lo: {aLo} · Yaxshi: {yaxshi} · Qoniqarli:{" "}
          {qoniqarli} · Yomon: {yomon}
        </Text>

        {qiyinSavollar.length > 0 && (
          <View>
            <Text style={uslub.qiyinSarlavha}>Eng ko&apos;p xato qilingan savollar:</Text>
            {qiyinSavollar.map((s, indeks) => (
              <Text key={indeks} style={uslub.qiyinQator}>
                {indeks + 1}. &quot;{s.matn}&quot; — faqat {s.togriFoiz}% to&apos;g&apos;ri javob
                berdi
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
