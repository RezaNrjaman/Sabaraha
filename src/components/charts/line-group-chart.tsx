"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatAngka, formatBulan, formatCompactRupiah, formatTon } from "@/lib/format";

export interface GarisConfig {
  key: string;
  label: string;
  color: string;
}

export type XFormat = "tanggal" | "bulan" | "raw";
export type YFormat = "rupiah" | "ton" | "angka";

const xFormatters: Record<XFormat, (value: string) => string> = {
  tanggal: (value) => value,
  bulan: (value) => formatBulan(value),
  raw: (value) => value,
};

const yFormatters: Record<YFormat, (value: number) => string> = {
  rupiah: (value) => formatCompactRupiah(value),
  ton: (value) => formatTon(value),
  angka: (value) => formatAngka(value, 1),
};

/** Grafik garis multi-seri untuk perbandingan kategori yang banyak (mis. antar tahun). */
export function LineGroupChart({
  data,
  xKey,
  garis,
  height = 280,
  xFormat = "raw",
  yFormat = "angka",
}: {
  data: Array<Record<string, string | number | null>>;
  xKey: string;
  garis: GarisConfig[];
  height?: number;
  xFormat?: XFormat;
  yFormat?: YFormat;
}) {
  const xFormatter = xFormatters[xFormat];
  const yFormatter = yFormatters[yFormat];

  return (
    <div className="min-w-0">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#E3E8E1" strokeDasharray="3 4" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickFormatter={(value: string) => xFormatter(value)}
            tick={{ fill: "#56635B", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#E3E8E1" }}
            minTickGap={8}
          />
          <YAxis
            tickFormatter={(value: number) => yFormatter(value)}
            tick={{ fill: "#56635B", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={56}
            domain={["auto", "auto"]}
          />
          <Tooltip
            cursor={{ stroke: "#3A9560", strokeDasharray: "4 4" }}
            formatter={(value, name) => [yFormatter(Number(value)), String(name)]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E3E8E1",
              boxShadow: "0 8px 24px rgba(16,24,20,.06)",
              fontSize: 14,
            }}
          />
          {garis.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={2}
              strokeDasharray={undefined}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {garis.map((item) => (
          <span key={item.key} className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
