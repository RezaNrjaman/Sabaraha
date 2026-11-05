import { formatRupiah, formatTanggal } from "@/lib/format";
import type { SeriesConfig, TrendPoint } from "@/lib/chart";

/** Tabel alternatif untuk grafik tren: mengikuti gaya tabel data bersama. */
export function TrendTable({
  data,
  series,
  mode = "harga",
}: {
  data: TrendPoint[];
  series: SeriesConfig[];
  mode?: "harga" | "indeks";
}) {
  return (
    <table className="w-full min-w-[640px] border-collapse text-base tabular-nums">
      <thead className="bg-bg text-ink-muted">
        <tr>
          <th scope="col" className="px-3 py-1.5 text-left">
            <span className="inline-flex min-h-11 items-center text-sm font-semibold">
              Tanggal
            </span>
          </th>
          {series.map((item) => (
            <th key={item.key} scope="col" className="px-3 py-1.5 text-right">
              <span className="inline-flex min-h-11 w-full items-center justify-end text-sm font-semibold">
                {item.label}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.tanggal} className="border-t border-line">
            <td className="h-14 px-3 py-3 text-left">{formatTanggal(row.tanggal)}</td>
            {series.map((item) => {
              const value = row[item.key];
              return (
                <td key={item.key} className="h-14 px-3 py-3 text-right">
                  {value === null || value === undefined
                    ? "–"
                    : mode === "indeks"
                      ? `${Number(value).toFixed(1)}`
                      : formatRupiah(Number(value))}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
