import { Info } from "lucide-react";

export function SimulationBanner({
  children = "Data ketersediaan di halaman ini adalah simulasi untuk keperluan demonstrasi, bukan data resmi.",
}: {
  children?: string;
}) {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-ctl border border-perhatian/20 bg-perhatian-bg px-4 py-3 text-sm text-perhatian"
    >
      <Info className="mt-0.5 shrink-0" size={18} />
      <p className="font-medium">{children}</p>
    </div>
  );
}
