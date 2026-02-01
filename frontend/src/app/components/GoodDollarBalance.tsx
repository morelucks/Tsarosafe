"use client";
import { useGoodDollarBalance } from "@/hooks/useGoodDollar";
import { USDAmount } from "./GDollarAmount";
import { useAccount } from "wagmi";

export default function GoodDollarBalance() {
  const { balanceFormatted, isLoading } = useGoodDollarBalance();
  const { chain } = useAccount();

  const isBase = chain?.id === 8453 || chain?.id === 84532;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-32 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  const bgClass = isBase
    ? "from-blue-600 to-blue-700 shadow-blue-500/10"
    : "from-green-500 to-green-600 shadow-green-500/10";

  return (
    <div className={`bg-gradient-to-r ${bgClass} rounded-lg shadow-lg p-4 text-white hover:scale-[1.02] transition-all duration-300 cursor-default relative overflow-hidden group`}>
      {/* Network Watermark */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <div className="text-6xl font-black text-white transform -rotate-12 translate-x-4 -translate-y-4 pointer-events-none uppercase">
          {isBase ? "Base" : "Celo"}
        </div>
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-medium opacity-90 tracking-wide uppercase">GoodDollar Balance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-black tracking-tighter">
              {balanceFormatted.toLocaleString(undefined, {
                maximumFractionDigits: 2
              })}
            </p>
            <span className="text-sm font-bold opacity-80">G$</span>
          </div>
          <div className="mt-1 opacity-80 decoration-dotted underline-offset-4 decoration-white/30">
            <USDAmount
              gdollarAmount={balanceFormatted}
              className="text-white/90 text-sm font-medium"
            />
          </div>
        </div>
        <div className="text-4xl filter drop-shadow-md">
          {isBase ? "🔵" : "💰"}
        </div>
      </div>

      {/* Decorative pulse line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 overflow-hidden">
        <div className={`h-full w-1/3 animate-[translateX_3s_infinite_linear] ${isBase ? "bg-white/40" : "bg-white/30"
          }`}></div>
      </div>
    </div>
  );
}
