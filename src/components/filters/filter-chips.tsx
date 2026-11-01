"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export function FilterChips({
  param,
  options,
  selected,
  label,
  multi = false,
  max = 5,
  allowClear = false,
  className,
}: {
  param: string;
  options: FilterOption[];
  selected: string[];
  label: string;
  multi?: boolean;
  max?: number;
  allowClear?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function pilih(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (multi) {
      const current = next.getAll(param);
      const sudahAda = current.includes(value);
      next.delete(param);
      if (sudahAda) {
        for (const item of current.filter((item) => item !== value)) next.append(param, item);
      } else if (current.length < max) {
        for (const item of current) next.append(param, item);
        next.append(param, value);
      } else {
        for (const item of current) next.append(param, item);
      }
    } else if (allowClear && selected[0] === value) {
      next.delete(param);
    } else {
      next.set(param, value);
    }
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="group" aria-label={label}>
      {options.map((option) => {
        const aktif = selected.includes(option.value);
        const penuh = multi && !aktif && selected.length >= max;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={aktif}
            disabled={penuh}
            title={penuh ? `Maksimal ${max} pilihan` : option.label}
            onClick={() => pilih(option.value)}
            className={cn(
              "min-h-10 rounded-full border px-3 text-sm font-medium transition-colors",
              aktif
                ? "border-primary-600 bg-primary-50 text-primary-700"
                : "border-line bg-surface text-ink-muted hover:border-primary-500 hover:text-ink",
              penuh && "cursor-not-allowed opacity-45",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ResetFilter({ href, label = "Atur ulang filter" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-10 items-center text-sm font-medium text-primary-700 underline-offset-2 hover:underline"
    >
      {label}
    </a>
  );
}
