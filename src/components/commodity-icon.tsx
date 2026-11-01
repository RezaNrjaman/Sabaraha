import {
  Beef,
  Candy,
  Droplets,
  Drumstick,
  Egg,
  Flame,
  Leaf,
  Sprout,
  Wheat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const ikonKomoditas: Record<string, LucideIcon> = {
  "Bawang Merah": Sprout,
  "Bawang Putih": Sprout,
  Beras: Wheat,
  "Cabai Merah": Flame,
  "Cabai Rawit": Flame,
  "Daging Ayam": Drumstick,
  "Daging Sapi": Beef,
  "Gula Pasir": Candy,
  "Minyak Goreng": Droplets,
  "Telur Ayam": Egg,
};

export function CommodityIcon({
  nama,
  className,
  ukuran = 20,
}: {
  nama: string;
  className?: string;
  ukuran?: number;
}) {
  const Icon = ikonKomoditas[nama] ?? Leaf;
  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700",
        className,
      )}
      aria-hidden="true"
    >
      <Icon size={ukuran} strokeWidth={1.75} />
    </span>
  );
}
