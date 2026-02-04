"use client";
import { useGDollarConversion } from "@/hooks/useGDollarPrice";

interface GDollarAmountProps {
  amount: number;
  showUSD?: boolean;
  showGDollar?: boolean;
  className?: string;
  usdClassName?: string;
  gdollarClassName?: string;
  format?: 'full' | 'compact' | 'minimal';
}

export default function GDollarAmount({
  amount,
  showUSD = true,
  showGDollar = true,
  className = "",
  usdClassName = "text-gray-600",
  gdollarClassName = "text-gray-900",
  format = 'full'
}: GDollarAmountProps) {
  const { getUSDValue, isLoading, rate } = useGDollarConversion();

  const usdValue = getUSDValue(amount);

  const formatGDollar = (value: number) => {
    if (format === 'minimal') {
      return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const formatUSD = (value: number) => {
    if (format === 'minimal') {
      if (value < 0.0001) return `<$0.0001`;
      if (value < 0.01) return `$${value.toFixed(4)}`;
      return `$${value.toFixed(2)}`;
    }
    if (value < 0.0001) return `< $0.0001`;
    if (value < 0.01) return `$${value.toFixed(6)}`;
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoading && rate === 0) {
    return (
      <div className={`inline-flex items-center space-x-1 ${className}`}>
        {showGDollar && (
          <span className={gdollarClassName}>
            {formatGDollar(amount)} G$
          </span>
        )}
        {showUSD && showGDollar && <span className="text-gray-400">•</span>}
        {showUSD && (
          <span className={`${usdClassName} animate-pulse`}>
            Loading...
          </span>
        )}
      </div>
    );
  }

  if (format === 'compact') {
    return (
      <div className={`inline-flex items-center space-x-1 ${className}`}>
        {showGDollar && (
          <span className={gdollarClassName}>
            {formatGDollar(amount)} G$
          </span>
        )}
        {showUSD && showGDollar && (
          <span className="text-gray-400 text-sm">
            ({formatUSD(usdValue)})
          </span>
        )}
        {showUSD && !showGDollar && (
          <span className={usdClassName}>
            {formatUSD(usdValue)}
          </span>
        )}
      </div>
    );
  }

  if (format === 'minimal') {
    if (showUSD && !showGDollar) {
      return <span className={`${usdClassName} ${className}`}>{formatUSD(usdValue)}</span>;
    }
    if (showGDollar && !showUSD) {
      return <span className={`${gdollarClassName} ${className}`}>{formatGDollar(amount)} G$</span>;
    }
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {showGDollar && (
        <div className={`font-medium ${gdollarClassName}`}>
          {formatGDollar(amount)} G$
        </div>
      )}
      {showUSD && (
        <div className={`text-sm ${usdClassName}`}>
          ≈ {formatUSD(usdValue)} USD
        </div>
      )}
    </div>
  );
}

// Utility component for inline G$ amounts with USD conversion
export function InlineGDollarAmount({
  amount,
  className = "",
  showBrackets = true
}: {
  amount: number;
  className?: string;
  showBrackets?: boolean;
}) {
  return (
    <GDollarAmount
      amount={amount}
      format="compact"
      className={className}
      showUSD={true}
      showGDollar={true}
      gdollarClassName="font-medium"
      usdClassName={showBrackets ? "text-gray-500" : "text-gray-600"}
    />
  );
}

// Utility component for USD-only display
export function USDAmount({
  gdollarAmount,
  className = "text-gray-600"
}: {
  gdollarAmount: number;
  className?: string;
}) {
  return (
    <GDollarAmount
      amount={gdollarAmount}
      format="minimal"
      className={className}
      showUSD={true}
      showGDollar={false}
      usdClassName={className}
    />
  );
}