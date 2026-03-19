import { Promotion, PROMOTIONS } from "@/types";

interface Props {
  promotion: Promotion;
}

const colorMap: Record<Promotion, string> = {
  novo: "bg-emerald-500",
  poslednja_velicina: "bg-rose-500",
  akcija: "bg-amber-400",
};

const textColorMap: Record<Promotion, string> = {
  novo: "text-white",
  poslednja_velicina: "text-white",
  akcija: "text-gray-900",
};

export default function PromotionRibbon({ promotion }: Props) {
  const promo = PROMOTIONS.find((p) => p.value === promotion);
  if (!promo) return null;

  const bg = colorMap[promotion];
  const text = textColorMap[promotion];

  return (
    <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-10">
      <div
        className={`absolute top-[1.9rem] right-[-65px] w-[13rem] text-center text-[9px] font-bold uppercase tracking-wide py-1 rotate-45 ${bg} ${text} shadow-sm`}
      >
        {promo.ribbonLabel}
      </div>
    </div>
  );
}
