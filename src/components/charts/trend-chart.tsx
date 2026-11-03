"use client";

import { useId } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatBulan, formatCompactRupiah, formatRupiah, formatTanggal, formatTanggalPendek } from "@/lib/format";
import type { SeriesConfig, TrendPoint } from "@/lib/chart";
import type { Periode } from "@/lib/types";
import { cn } from "@/lib/utils";

const warnaPeriode: Record<string, string> = {
  Ramadan: "#7C3AED",
  "Idul Fitri": "#F2B01E",
  "Idul Adha": "#C2410C",
  "Natal-Tahun Baru": "#1F6FA8",
  "Natal–Tahun Baru": "#1F6FA8",
  "Musim Hujan": "#0E7490",
};

function TooltipIsi({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    dataKey?: string | number;
    name?: string | number;
    value?: string | number;
    color?: string;
  }>;
  label?: string | number;
  valueFormatter: (value: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-ctl border border-line bg-surface px-3 py-2 shadow-card">
      <p className="mb-1.5 text-sm font-semibold text-ink">
        {formatTanggal(String(label))}
      </p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div
            key={String(item.dataKey)}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="flex items-center gap-1.5 text-ink-muted">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color ?? "#2B7A4B" }}
              />
              {String(item.name ?? item.dataKey)}
            </span>
            <span className="font-semibold text-ink">
              {item.value === null || item.value === undefined
                ? "-"
                : valueFormatter(Number(item.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrendChart({
  data,
  series,
  periods = [],
  height = 280,
  mode = "harga",
  showArea = false,
  spikes = [],
  className,
  xFormat = "tanggal",
}: {
  data: TrendPoint[];
  series: SeriesConfig[];
  periods?: Periode[];
  height?: number;
  mode?: "harga" | "indeks";
  showArea?: boolean;
  spikes?: Array<{ tanggal: string; harga: number; label?: string }>;
  className?: string;
  xFormat?: "tanggal" | "bulan";
}) {
  const gradientId = useId().replace(/:/g, "");
  const labelPeriode = new Set<string>();
  const xFormatter = xFormat === "bulan" ? formatBulan : formatTanggalPendek;
  const valueFormatter = (value: number) =>
    mode === "indeks" ? `${value.toFixed(1)}` : formatRupiah(value);
  const yFormatter = (value: number) =>
    mode === "indeks" ? String(Math.round(value)) : formatCompactRupiah(value);

  return (
    <div className={cn("min-w-0", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series[0]?.color ?? "#2B7A4B"} stopOpacity={0.22} />
              <stop offset="100%" stopColor={series[0]?.color ?? "#2B7A4B"} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E3E8E1" strokeDasharray="3 4" vertical={false} />
          {periods.map((periode) => {
            const warna = warnaPeriode[periode.nama] ?? "#7C3AED";
            const tampilkanLabel = !labelPeriode.has(periode.nama);
            if (tampilkanLabel) labelPeriode.add(periode.nama);
            return (
              <ReferenceArea
                key={`${periode.id}-${periode.tanggal_mulai}`}
                x1={periode.tanggal_mulai}
                x2={periode.tanggal_selesai}
                fill={warna}
                fillOpacity={0.12}
                strokeOpacity={0}
                label={
                  tampilkanLabel
                    ? {
                        value: periode.nama,
                        position: "insideTopLeft",
                        fill: warna,
                        fontSize: 12,
                      }
                    : undefined
                }
              />
            );
          })}
          <XAxis
            dataKey="tanggal"
            tickFormatter={(value: string) => xFormatter(value)}
            tick={{ fill: "#56635B", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#E3E8E1" }}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(value: number) => yFormatter(value)}
            tick={{ fill: "#56635B", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={64}
            domain={["auto", "auto"]}
          />
          <Tooltip
            content={<TooltipIsi valueFormatter={valueFormatter} />}
            cursor={{ stroke: "#3A9560", strokeDasharray: "4 4" }}
          />
          {showArea && series[0] ? (
            <Area
              type="monotone"
              dataKey={series[0].key}
              name={series[0].label}
              stroke={series[0].color}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              connectNulls={false}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "#FFFFFF" }}
            />
          ) : null}
          {!showArea
            ? series.map((item) => (
                <Line
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  name={item.label}
                  stroke={item.color}
                  strokeWidth={2.25}
                  strokeDasharray={item.dashed ? "7 4" : undefined}
                  connectNulls={false}
                  isAnimationActive={false}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: "#FFFFFF" }}
                />
              ))
            : null}
          {spikes.map((point) => (
            <ReferenceDot
              key={`${point.tanggal}-${point.harga}`}
              x={point.tanggal}
              y={point.harga}
              r={5}
              fill="#B3261E"
              stroke="#FFFFFF"
              strokeWidth={2}
              ifOverflow="extendDomain"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2" aria-label="Legenda grafik">
        {series.map((item) => (
          <span key={item.key} className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <span
              className="inline-block h-0.5 w-5 rounded-full"
              style={{
                backgroundColor: item.color,
                backgroundImage: item.dashed
                  ? "repeating-linear-gradient(90deg, transparent 0 3px, #fff 3px 5px)"
                  : undefined,
              }}
            />
            {item.label}
          </span>
        ))}
        {spikes.length > 0 ? (
          <span className="inline-flex items-center gap-2 text-sm text-naik">
            <span className="size-2.5 rounded-full border-2 border-white bg-naik shadow" />
            Lonjakan
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function tableHargaUntukTren(
  data: TrendPoint[],
  series: SeriesConfig[],
  mode: "harga" | "indeks" = "harga",
) {
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
