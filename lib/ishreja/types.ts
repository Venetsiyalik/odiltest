import type { IshrejaQatori } from "@/lib/ishreja/qatorlar";

export type IshrejaAmali = "yozish" | "almashtirish" | "otkazib-yuborish";

/** Admin ko'rib chiqib tasdiqlagandan keyin API'ga jo'natiladigan bitta fayl. */
export interface IshrejaImportFayli {
  faylNomi: string;
  daraja: number;
  fanId: number | null;
  yangiFanNomi: string | null;
  chorak: number | null;
  oquvYili: string | null;
  amal: IshrejaAmali;
  qatorlar: IshrejaQatori[];
}

export interface IshrejaImportSorovi {
  fayllar: IshrejaImportFayli[];
}

export interface IshrejaFaylNatijasi {
  faylNomi: string;
  holati: "muvaffaqiyatli" | "otkazib-yuborildi" | "xato";
  qoshildiSoni: number;
  xabar?: string;
}

export interface IshrejaImportNatijasi {
  xato?: string;
  fayllar: IshrejaFaylNatijasi[];
  jamiMavzu: number;
}
