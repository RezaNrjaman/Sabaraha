import { describe, expect, it } from "vitest";

import { normalisasiBagian } from "@/lib/navigation";
import {
  buildQuery,
  bulanSebelum,
  hariSebelum,
  pilihanParam,
  rentangHari,
} from "@/lib/query";

describe("query", () => {
  it("meng-encode spasi dan melewati nilai kosong", () => {
    expect(
      buildQuery({ komoditas: "Cabai Merah", agregasi: "bulanan", kosong: "" }),
    ).toBe("?komoditas=Cabai+Merah&agregasi=bulanan");
  });

  it("mengembalikan string kosong bila tidak ada parameter", () => {
    expect(buildQuery({})).toBe("");
    expect(buildQuery({ dari: undefined, sampai: null })).toBe("");
  });

  it("menghitung rentang hari kalender", () => {
    expect(hariSebelum("2026-10-20", 30)).toBe("2026-09-20");
    expect(rentangHari("2026-10-20", 365)).toEqual({
      dari: "2025-10-20",
      sampai: "2026-10-20",
    });
  });

  it("menghitung bulan sebelumnya tanpa meleset di akhir bulan", () => {
    expect(bulanSebelum("2026-03-31", 1)).toBe("2026-02-28");
    expect(bulanSebelum("2026-10-20", 12)).toBe("2025-10-20");
    expect(bulanSebelum("2024-03-31", 1)).toBe("2024-02-29");
  });

  it("memilih parameter pertama atau fallback", () => {
    expect(pilihanParam(["Cabai Merah", "Beras"], "Beras")).toBe("Cabai Merah");
    expect(pilihanParam(undefined, "Beras")).toBe("Beras");
  });
});

describe("normalisasiBagian", () => {
  it("menerima enam bagian dashboard", () => {
    for (const kunci of ["tren", "periode", "volatilitas", "ketersediaan", "prediksi"]) {
      expect(normalisasiBagian(kunci)).toBe(kunci);
    }
    expect(normalisasiBagian(undefined)).toBe("ringkasan");
  });

  it("mengambil nilai pertama bila parameter berulang", () => {
    expect(normalisasiBagian(["prediksi", "tren"])).toBe("prediksi");
  });

  it("jatuh ke ringkasan untuk nilai yang tidak dikenal", () => {
    expect(normalisasiBagian("halaman-lain")).toBe("ringkasan");
    expect(normalisasiBagian("")).toBe("ringkasan");
  });
});
