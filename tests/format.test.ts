import { describe, expect, it } from "vitest";

import {
  formatBulan,
  formatCompactRupiah,
  formatHari,
  formatPersen,
  formatPersenBertanda,
  formatRupiah,
  formatTanggal,
  formatTon,
  statusHarga,
  statusNeraca,
} from "@/lib/format";

describe("format angka", () => {
  it("memformat rupiah dan null", () => {
    expect(formatRupiah(42500)).toBe("Rp 42.500");
    expect(formatRupiah(42500, "kg")).toBe("Rp 42.500/kg");
    expect(formatRupiah(null)).toBe("-");
  });

  it("memformat rupiah ringkas untuk sumbu grafik", () => {
    expect(formatCompactRupiah(45000)).toBe("Rp 45 rb");
    expect(formatCompactRupiah(1250000)).toBe("Rp 1,3 jt");
    expect(formatCompactRupiah(500)).toBe("Rp 500");
  });

  it("memformat persen dengan koma dan tanda", () => {
    expect(formatPersen(12.345)).toBe("12,3%");
    expect(formatPersen(12.345, 2)).toBe("12,35%");
    expect(formatPersen(-0.4)).toBe("-0,4%");
    expect(formatPersenBertanda(5.2)).toBe("+5,2%");
  });

  it("memformat tanggal dan bulan dalam bahasa Indonesia", () => {
    expect(formatTanggal("2026-10-20")).toBe("20 Okt 2026");
    expect(formatBulan("2026-10-01")).toBe("Okt 2026");
    expect(formatTanggal(null)).toBe("-");
  });

  it("memformat ton dan hari", () => {
    expect(formatTon(1234.56)).toBe("1.234,6 ton");
    expect(formatHari(16)).toBe("16 hari");
  });
});

describe("status", () => {
  it("menentukan status harga dari ambang 1 persen", () => {
    expect(statusHarga(0.4)).toBe("Stabil");
    expect(statusHarga(1.2)).toBe("Naik");
    expect(statusHarga(-2)).toBe("Turun");
    expect(statusHarga(null)).toBe("Stabil");
  });

  it("menentukan status neraca dari ambang 5 persen", () => {
    expect(statusNeraca(5)).toBe("Surplus");
    expect(statusNeraca(4.99)).toBe("Seimbang");
    expect(statusNeraca(-5)).toBe("Defisit");
  });
});
