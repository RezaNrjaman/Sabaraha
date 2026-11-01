import { formatRupiah, formatTanggal } from "@/lib/format";
import type { SeriesConfig, TrendPoint } from "@/lib/chart";

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
    <table className="w-full min-w-[640px] border-collapse text-sm">
      <thead className="sticky top-0 bg-bg text-left text-ink-muted">
        <tr>
          <th className="px-3 py-2 font-medium">Tanggal</th>
          {series.map((item) => (
            <th key={item.key} className="px-3 py-2 font-medium">
              {item.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.tanggal} className="border-t border-line">
            <td className="px-3 py-2">{formatTanggal(row.tanggal)}</td>
            {series.map((item) => {
              const value = row[item.key];
              return (
                <td key={item.key} className="px-3 py-2">
                  {value === null || value === undefined
                    ? "-"
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
