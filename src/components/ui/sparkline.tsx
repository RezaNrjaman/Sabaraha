"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { ChartTooltip } from "@/components/ui/chart-tooltip";
import { formatAngka } from "@/lib/format";
import { cn } from "@/lib/utils";

export type TitikSparkline = { label: string; nilai: number | null };

const TINGGI = 56;
const AREA_ATAS = 8;
const AREA_BAWAH = 38;
const LABEL_Y = 52;

/**
 * Sparkline 12 bulan untuk kartu KPI:
 * garis tipis warna utama, titik terakhir lebih besar, dua label sumbu
 * (bulan awal & akhir), garis putus-putus rata-rata, titik merah pada
 * lonjakan (di atas rata-rata + 2 simpangan baku), tooltip pada hover,
 * sentuh, dan papan ketik (panah kiri/kanan).
 */
export function Sparkline({
  data,
  ariaLabel,
  desimal = 0,
  satuanTeks = "",
  className,
}: {
  data: TitikSparkline[];
  ariaLabel: string;
  /** Jumlah desimal pada angka tooltip (dipakai formatAngka). */
  desimal?: number;
  /** Teks setelah angka, mis. " komoditas". */
  satuanTeks?: string;
  className?: string;
}) {
  const wadah = useRef<HTMLDivElement>(null);
  const [lebar, setLebar] = useState(0);
  const [aktif, setAktif] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wadah.current;
    if (!el) return;
    const amati = new ResizeObserver((entries) => {
      setLebar(Math.round(entries[0].contentRect.width));
    });
    amati.observe(el);
    setLebar(Math.round(el.clientWidth));
    return () => amati.disconnect();
  }, []);

  const isi = data.filter((titik): titik is { label: string; nilai: number } => titik.nilai !== null);
  const cukup = isi.length >= 2;

  const rata = cukup ? isi.reduce((a, b) => a + b.nilai, 0) / isi.length : 0;
  const simpangan = cukup
    ? Math.sqrt(isi.reduce((a, b) => a + (b.nilai - rata) ** 2, 0) / Math.max(1, isi.length - 1))
    : 0;
  const batasLonjakan = rata + 2 * simpangan;

  const nilai = isi.map((t) => t.nilai);
  const min = cukup ? Math.min(...nilai) : 0;
  const max = cukup ? Math.max(...nilai) : 1;
  const rentang = max - min || 1;
  const pad = rentang * 0.15;
  const lo = min - pad;
  const hi = max + pad;

  const langkah = lebar > 0 ? lebar / Math.max(1, isi.length - 1) : 0;
  const x = (i: number) => (isi.length === 1 ? lebar / 2 : 4 + i * ((lebar - 8) / (isi.length - 1)));
  const y = (v: number) =>
    AREA_BAWAH - ((v - lo) / (hi - lo || 1)) * (AREA_BAWAH - AREA_ATAS);

  const garis = cukup && lebar > 0 ? isi.map((t, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(t.nilai).toFixed(1)}`).join(" ") : "";

  const titikTerakhir = cukup ? isi.length - 1 : -1;
  const dipilih = aktif !== null && aktif < isi.length ? aktif : null;

  function tekan(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!cukup) return;
    const sekarang = dipilih ?? titikTerakhir;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setAktif(Math.min(isi.length - 1, sekarang + 1));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setAktif(Math.max(0, sekarang - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setAktif(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setAktif(isi.length - 1);
    } else if (event.key === "Escape") {
      setAktif(null);
    }
  }

  return (
    <div
      ref={wadah}
      role="img"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={tekan}
      onMouseLeave={() => setAktif(null)}
      onBlur={() => setAktif(null)}
      className={cn(
        "relative h-14 w-full outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        className,
      )}
    >
      {!cukup ? (
        <span className="flex h-full items-center justify-center text-sm text-ink-muted" aria-hidden="true">
          –
        </span>
      ) : lebar > 0 ? (
        <>
          <svg
            aria-hidden="true"
            width={lebar}
            height={TINGGI}
            viewBox={`0 0 ${lebar} ${TINGGI}`}
            className="block overflow-visible"
          >
            <line
              x1={0}
              x2={lebar}
              y1={y(rata)}
              y2={y(rata)}
              className="stroke-ink-muted"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <path
              d={garis}
              fill="none"
              className="stroke-primary-600"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {isi.map((t, i) => {
              const lonjakan = t.nilai > batasLonjakan && simpangan > 0;
              const terakhir = i === titikTerakhir;
              return (
                <circle
                  key={t.label}
                  cx={x(i)}
                  cy={y(t.nilai)}
                  r={terakhir ? 3.5 : lonjakan ? 3 : 2.5}
                  className={lonjakan ? "fill-naik" : terakhir ? "fill-primary-600" : "fill-primary-500"}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
              );
            })}
            <text x={0} y={LABEL_Y} fontSize={12} className="fill-ink-muted">
              {isi[0].label}
            </text>
            <text x={lebar} y={LABEL_Y} fontSize={12} textAnchor="end" className="fill-ink-muted">
              {isi[isi.length - 1].label}
            </text>
            {isi.map((t, i) => (
              <rect
                key={`sentuh-${t.label}`}
                x={Math.max(0, x(i) - langkah / 2)}
                y={0}
                width={Math.max(4, langkah)}
                height={TINGGI}
                fill="transparent"
                onMouseEnter={() => setAktif(i)}
                onTouchStart={() => setAktif(i)}
              />
            ))}
          </svg>
          {dipilih !== null ? (
            <ChartTooltip
              status
              className="absolute bottom-full mb-1 -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${Math.min(Math.max(x(dipilih), 60), Math.max(60, lebar - 60))}px` }}
            >
              <span className="block text-ink-muted">{isi[dipilih].label}</span>
              <span className="block font-semibold tabular-nums text-ink">
                {formatAngka(isi[dipilih].nilai, desimal)}
                {satuanTeks}
              </span>
            </ChartTooltip>
          ) : null}
        </>
      ) : null}
      {dipilih !== null && lebar > 0 ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 h-11 w-px bg-line"
          style={{ left: `${x(dipilih)}px` }}
        />
      ) : null}
    </div>
  );
}
