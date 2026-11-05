import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChartCard } from "@/components/ui/chart-card";
import { BagianTabs } from "@/components/dashboard/bagian-tabs";
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

describe("ChartCard", () => {
  it("menampilkan tabel alternatif setelah tombol diklik", async () => {
    const user = userEvent.setup();
    render(
      <ChartCard
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
      </ChartCard>,
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

describe("BagianTabs", () => {
  it("menandai tab aktif lalu menggesernya masuk pandangan", () => {
    const gulir = vi.spyOn(Element.prototype, "scrollIntoView");
    render(<BagianTabs aktif="prediksi" />);

    expect(screen.getByRole("link", { name: /prediksi/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /ringkasan/i })).not.toHaveAttribute("aria-current");
    expect(gulir).toHaveBeenCalledWith({ block: "nearest", inline: "nearest" });
  });

  it("menautkan tiap tab ke halaman dashboard tunggal, bukan rute lama", () => {
    render(<BagianTabs aktif="tren" />);

    expect(screen.getByRole("link", { name: /ringkasan/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /tren harga/i })).toHaveAttribute(
      "href",
      "/?bagian=tren",
    );
    expect(screen.getByRole("link", { name: /ketersediaan/i })).toHaveAttribute(
      "href",
      "/?bagian=ketersediaan",
    );
    expect(screen.getByRole("navigation", { name: /bagian dashboard/i })).toBeInTheDocument();
  });
});
