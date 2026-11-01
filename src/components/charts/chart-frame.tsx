"use client";

import { Table2 } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ChartFrame({
  title,
  description,
  summary,
  children,
  table,
  action,
  className,
  source,
  footer,
}: {
  title: string;
  description?: string;
  summary: string;
  children: ReactNode;
  table?: ReactNode;
  action?: ReactNode;
  className?: string;
  source?: string;
  footer?: ReactNode;
}) {
  const [tabelTerbuka, setTabelTerbuka] = useState(false);

  return (
    <Card className={cn("flex min-w-0 flex-col", className)}>
      <CardHeader
        title={title}
        description={description}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {action}
            {table ? (
              <button
                type="button"
                aria-pressed={tabelTerbuka}
                onClick={() => setTabelTerbuka((nilai) => !nilai)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-ctl border border-line bg-surface px-3 text-sm font-medium text-ink hover:border-primary-500 hover:bg-primary-50"
              >
                <Table2 size={15} />
                {tabelTerbuka ? "Sembunyikan tabel" : "Lihat sebagai tabel"}
              </button>
            ) : null}
          </div>
        }
      />
      <div className="min-w-0 flex-1">
        <div role="img" aria-label={summary}>
          {children}
        </div>
        {tabelTerbuka && table ? (
          <div className="mt-5 max-h-80 overflow-auto rounded-ctl border border-line">
            {table}
          </div>
        ) : null}
      </div>
      {footer ? <div className="mt-5 border-t border-line pt-4">{footer}</div> : null}
      {source ? (
        <p className="mt-4 border-t border-line pt-3 text-xs text-ink-muted">{source}</p>
      ) : null}
    </Card>
  );
}
