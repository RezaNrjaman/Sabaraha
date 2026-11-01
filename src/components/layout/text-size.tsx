"use client";

import { useEffect, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

const pilihan = [
  { id: "normal", label: "A", title: "Ukuran teks normal" },
  { id: "besar", label: "A+", title: "Ukuran teks besar" },
  { id: "sangat-besar", label: "A++", title: "Ukuran teks sangat besar" },
] as const;

type Ukuran = (typeof pilihan)[number]["id"];

const KUNCI = "sabaraha-ukuran-teks";
const EVENT = "sabaraha-ukuran-teks-berubah";

function ukuranValid(value: string | null): value is Ukuran {
  return value === "normal" || value === "besar" || value === "sangat-besar";
}

function getSnapshot(): Ukuran {
  if (typeof window === "undefined") return "normal";
  const tersimpan = window.localStorage.getItem(KUNCI);
  return ukuranValid(tersimpan) ? tersimpan : "normal";
}

function getServerSnapshot(): Ukuran {
  return "normal";
}

function subscribe(callback: () => void) {
  const handler = () => callback();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function simpan(nilai: Ukuran) {
  window.localStorage.setItem(KUNCI, nilai);
  window.dispatchEvent(new Event(EVENT));
}

export function TextSize() {
  const ukuran = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.dataset.textSize = ukuran;
  }, [ukuran]);

  return (
    <div
      className="inline-flex items-center rounded-ctl border border-line bg-surface p-1"
      role="group"
      aria-label="Ukuran teks"
    >
      {pilihan.map((item) => (
        <button
          key={item.id}
          type="button"
          title={item.title}
          aria-label={item.title}
          aria-pressed={ukuran === item.id}
          onClick={() => simpan(item.id)}
          className={cn(
            "min-h-9 min-w-9 rounded-[9px] px-1.5 text-sm font-semibold transition-colors",
            ukuran === item.id
              ? "bg-primary-600 text-white"
              : "text-ink-muted hover:bg-primary-50 hover:text-primary-700",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
