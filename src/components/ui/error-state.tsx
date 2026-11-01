"use client";

import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Data belum bisa dimuat",
  message = "Coba lagi beberapa saat. Data API mungkin sedang tidak dapat dihubungi.",
}: {
  title?: string;
  message?: string;
}) {
  const router = useRouter();
  const [memuat, setMemuat] = useState(false);

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 rounded-card border border-naik/20 bg-naik-bg p-5 text-naik sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="flex gap-3">
        <TriangleAlert className="mt-0.5 shrink-0" size={22} />
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-base text-naik/90">{message}</p>
        </div>
      </div>
      <Button
        variant="danger"
        size="sm"
        disabled={memuat}
        onClick={() => {
          setMemuat(true);
          router.refresh();
          window.setTimeout(() => setMemuat(false), 1200);
        }}
      >
        {memuat ? "Memuat…" : "Muat ulang"}
      </Button>
    </div>
  );
}
