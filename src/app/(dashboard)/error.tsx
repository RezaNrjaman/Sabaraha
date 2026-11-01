"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-6">
      <ErrorState />
      <button
        type="button"
        onClick={reset}
        className="mt-4 text-sm font-medium text-primary-700 underline"
      >
        Coba muat ulang halaman
      </button>
    </div>
  );
}
