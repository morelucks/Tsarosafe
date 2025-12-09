"use client";
import { useGoodDollarBalance } from "@/hooks/useGoodDollar";

export default function GoodDollarBalance() {
  const { balanceFormatted, isLoading } = useGoodDollarBalance();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">GoodDollar Balance</p>
          <p className="text-2xl font-bold mt-1">
            {balanceFormatted.toLocaleString(undefined, { 
              maximumFractionDigits: 2 
            })} G$
          </p>
        </div>
        <div className="text-3xl">💰</div>
      </div>
    </div>
  );
}

