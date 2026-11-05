import { BagianTabs } from "@/components/dashboard/bagian-tabs";
import { KetersediaanSection } from "@/components/sections/ketersediaan-section";
import { PeriodeSection } from "@/components/sections/periode-section";
import { PrediksiSection } from "@/components/sections/prediksi-section";
import { RingkasanSection } from "@/components/sections/ringkasan-section";
import { TrenSection } from "@/components/sections/tren-section";
import { VolatilitasSection } from "@/components/sections/volatilitas-section";
import { JUDUL_BAGIAN, normalisasiBagian, type KunciBagian } from "@/lib/navigation";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  return { title: JUDUL_BAGIAN[normalisasiBagian(sp.bagian)] };
}

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const bagian: KunciBagian = normalisasiBagian(sp.bagian);

  return (
    <>
      <BagianTabs aktif={bagian} />
      <AktifkanBagian bagian={bagian} sp={sp} />
    </>
  );
}

function AktifkanBagian({
  bagian,
  sp,
}: {
  bagian: KunciBagian;
  sp: Record<string, string | string[] | undefined>;
}) {
  switch (bagian) {
    case "tren":
      return <TrenSection sp={sp} />;
    case "periode":
      return <PeriodeSection sp={sp} />;
    case "volatilitas":
      return <VolatilitasSection sp={sp} />;
    case "ketersediaan":
      return <KetersediaanSection sp={sp} />;
    case "prediksi":
      return <PrediksiSection sp={sp} />;
    case "ringkasan":
      return <RingkasanSection />;
  }
}
