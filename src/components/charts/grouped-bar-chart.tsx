"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatAngka, formatBulan, formatCompactRupiah, formatTon } from "@/lib/format";

export interface BarConfig {
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

export function GroupedBarChart({
  data,
  xKey,
  bars,
  height = 280,
  xFormat = "tanggal",
  yFormat = "angka",
}: {
  data: Array<Record<string, string | number | null>>;
  xKey: string;
  bars: BarConfig[];
  height?: number;
  xFormat?: XFormat;
  yFormat?: YFormat;
}) {
  const xFormatter = xFormatters[xFormat];
  const yFormatter = yFormatters[yFormat];

  return (
    <div className="min-w-0">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }} barGap={4}>
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
          />
          <Tooltip
            cursor={{ fill: "#EEF6F0" }}
            formatter={(value, name) => [yFormatter(Number(value)), String(name)]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E3E8E1",
              boxShadow: "0 8px 24px rgba(16,24,20,.06)",
              fontSize: 14,
            }}
          />
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.label}
              fill={bar.color}
              radius={[5, 5, 0, 0]}
              maxBarSize={22}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {bars.map((bar) => (
          <span key={bar.key} className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: bar.color }} />
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );
}
