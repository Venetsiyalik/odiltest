import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const uslub = StyleSheet.create({
  sahifa: { fontFamily: "DejaVu Sans", padding: 24 },
  grid: { display: "flex", flexDirection: "row", flexWrap: "wrap" },
  karta: {
    width: "50%",
    height: 180,
    padding: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#999",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  maktabNomi: { fontSize: 10, color: "#555", marginBottom: 8 },
  ismFamiliya: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  sinfNomi: { fontSize: 11, color: "#333", marginBottom: 12 },
  kodYorlik: { fontSize: 9, color: "#666", marginBottom: 4 },
  kod: { fontSize: 26, fontWeight: "bold", letterSpacing: 4 },
});

export interface KirishKodiKartasi {
  ismFamiliya: string;
  sinfNomi: string;
  kirishKodi: string;
}

const KARTALAR_SAHIFADA = 8;

export function KirishKodlariHisoboti({
  maktabNomi,
  kartalar,
}: {
  maktabNomi: string;
  kartalar: KirishKodiKartasi[];
}) {
  const sahifalar: KirishKodiKartasi[][] = [];
  for (let i = 0; i < kartalar.length; i += KARTALAR_SAHIFADA) {
    sahifalar.push(kartalar.slice(i, i + KARTALAR_SAHIFADA));
  }
  if (sahifalar.length === 0) sahifalar.push([]);

  return (
    <Document>
      {sahifalar.map((sahifaKartalari, sahifaIndeksi) => (
        <Page key={sahifaIndeksi} size="A4" style={uslub.sahifa}>
          <View style={uslub.grid}>
            {sahifaKartalari.map((karta, indeks) => (
              <View key={indeks} style={uslub.karta}>
                <Text style={uslub.maktabNomi}>{maktabNomi}</Text>
                <Text style={uslub.ismFamiliya}>{karta.ismFamiliya}</Text>
                <Text style={uslub.sinfNomi}>{karta.sinfNomi} sinf</Text>
                <Text style={uslub.kodYorlik}>Kirish kodingiz</Text>
                <Text style={uslub.kod}>{karta.kirishKodi}</Text>
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
}
