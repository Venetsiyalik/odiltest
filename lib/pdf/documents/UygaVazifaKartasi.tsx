import { Document, Page, Text, StyleSheet } from "@react-pdf/renderer";

const uslub = StyleSheet.create({
  sahifa: { fontFamily: "DejaVu Sans", padding: 32 },
  sarlavha: { fontSize: 10, color: "#555", marginBottom: 16 },
  ismFamiliya: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  mavzu: { fontSize: 13, color: "#333", marginBottom: 20 },
  yorliq: { fontSize: 11, fontWeight: "bold", marginBottom: 8 },
  matn: { fontSize: 12, lineHeight: 1.6 },
});

export interface UygaVazifaKartasiMalumoti {
  ismFamiliya: string;
  sinfNomi: string;
  mavzuNomi: string | null;
  matn: string;
}

export function UygaVazifaKartasi({
  maktabNomi,
  malumot,
}: {
  maktabNomi: string;
  malumot: UygaVazifaKartasiMalumoti;
}) {
  return (
    <Document>
      <Page size="A5" style={uslub.sahifa}>
        <Text style={uslub.sarlavha}>{maktabNomi} — Yordam topshirig&apos;i</Text>
        <Text style={uslub.ismFamiliya}>{malumot.ismFamiliya}</Text>
        <Text style={uslub.mavzu}>
          {malumot.sinfNomi} sinf{malumot.mavzuNomi ? ` · ${malumot.mavzuNomi}` : ""}
        </Text>
        <Text style={uslub.yorliq}>Topshiriq:</Text>
        <Text style={uslub.matn}>{malumot.matn}</Text>
      </Page>
    </Document>
  );
}
