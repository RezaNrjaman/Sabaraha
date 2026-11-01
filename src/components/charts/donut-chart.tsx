"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface DonutDatum {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  totalLabel = "komoditas",
  height = 240,
}: {
  data: DonutDatum[];
  totalLabel?: string;
  height?: number;
}) {
  const total = data.reduce((jumlah, item) => jumlah + item.value, 0);

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="88%"
            paddingAngle={3}
            cornerRadius={6}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((item) => (
              <Cell key={item.name} fill={item.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${Number(value)}`, String(name)]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E3E8E1",
              boxShadow: "0 8px 24px rgba(16,24,20,.06)",
              fontSize: 14,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold leading-9 text-ink">{total}</span>
        <span className="text-sm text-ink-muted">{totalLabel}</span>
      </div>
    </div>
  );
}
