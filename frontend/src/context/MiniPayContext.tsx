"use client";
import React, { createContext, useState, useEffect } from 'react';

interface MiniPayContextType {
  isMiniPay: boolean;
  isMiniPayConnected: boolean;
  minipayBalance: string;
  autoConnectMiniPay: () => void;
}

const MiniPayContext = createContext<MiniPayContextType | undefined>(undefined);

export function MiniPayProvider({ children }: { children: React.ReactNode }) {
  const [isMiniPay, setIsMiniPay] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ethereum = (window as any).ethereum;
      const isMP = !!(ethereum?.isMiniPay || (window as any).web3?.currentProvider?.isMiniPay);
      setIsMiniPay(isMP);
    }
  }, []);

  return (
    <MiniPayContext.Provider value={{ isMiniPay, isMiniPayConnected: false, minipayBalance: '0.00', autoConnectMiniPay: () => {} }}>
      {children}
    </MiniPayContext.Provider>
  );
}
