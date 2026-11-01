import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ChartFrame } from "@/components/charts/chart-frame";
import { PriceTable } from "@/components/dashboard/price-table";
import { StatusChip } from "@/components/ui/status-chip";
import type { HargaTerkini } from "@/lib/types";

describe("StatusChip", () => {
  it("menampilkan ikon dan kata status, bukan warna saja", () => {
    const { container } = render(<StatusChip status="Naik" />);
    expect(screen.getByText("Naik")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("mendukung status ketersediaan", () => {
    render(<StatusChip status="Defisit" />);
    expect(screen.getByText("Defisit")).toBeInTheDocument();
  });
});

describe("ChartFrame", () => {
  it("menampilkan tabel alternatif setelah tombol diklik", async () => {
    const user = userEvent.setup();
    render(
      <ChartFrame
        title="Grafik contoh"
        summary="Ringkasan grafik contoh"
        table={
          <table>
            <tbody>
              <tr>
                <td>baris tabel</td>
              </tr>
            </tbody>
          </table>
        }
      >
        <div>isi grafik</div>
      </ChartFrame>,
    );

    expect(screen.getByRole("img", { name: "Ringkasan grafik contoh" })).toBeInTheDocument();
    expect(screen.queryByText("baris tabel")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /lihat sebagai tabel/i }));
    expect(screen.getByText("baris tabel")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sembunyikan tabel/i }),
    ).toBeInTheDocument();
  });
});

describe("PriceTable", () => {
  const data: HargaTerkini[] = [
    {
      komoditas_id: 4,
      nama: "Cabai Merah",
      satuan: "kg",
      tanggal_terkini: "2026-10-20",
      harga_terkini: 86000,
      perubahan: { satu_hari: null, tujuh_hari: 12.4, tiga_puluh_hari: null },
      status: "Naik",
      grafik_mini: [],
    },
    {
      komoditas_id: 3,
      nama: "Beras",
      satuan: "kg",
      tanggal_terkini: "2026-10-20",
      harga_terkini: null,
      perubahan: { satu_hari: null, tujuh_hari: null, tiga_puluh_hari: null },
      status: "Stabil",
      grafik_mini: [],
    },
  ];

  it("menampilkan harga kosong sebagai tanda hubung, bukan nol", () => {
    render(<PriceTable data={data} />);
    expect(screen.getAllByText("Beras").length).toBeGreaterThan(0);
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("memfilter berdasarkan pencarian", async () => {
    const user = userEvent.setup();
    render(<PriceTable data={data} />);
    await user.type(screen.getByRole("searchbox"), "cabai");
    expect(screen.getAllByText("Cabai Merah").length).toBeGreaterThan(0);
    expect(screen.queryByText("Beras")).not.toBeInTheDocument();
  });
});
