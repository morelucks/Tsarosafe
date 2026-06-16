"use client";
import React, { createContext, useState, useEffect } from 'react';
import { useAccount, useConnect, useConnectors } from 'wagmi';

interface MiniPayContextType {
  isMiniPay: boolean;
  isMiniPayConnected: boolean;
  minipayBalance: string;
  autoConnectMiniPay: () => void;
}

const MiniPayContext = createContext<MiniPayContextType | undefined>(undefined);

export function MiniPayProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const [isMiniPay, setIsMiniPay] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ethereum = (window as any).ethereum;
      const isMP = !!(ethereum?.isMiniPay || (window as any).web3?.currentProvider?.isMiniPay || (typeof navigator !== 'undefined' && /MiniPay/i.test(navigator.userAgent)));
      setIsMiniPay(isMP);
    }
  }, []);

  const autoConnectMiniPay = () => {};

  return (
    <MiniPayContext.Provider value={{ isMiniPay, isMiniPayConnected: isMiniPay && isConnected, minipayBalance: '0.00', autoConnectMiniPay }}>
      {children}
    </MiniPayContext.Provider>
  );
}
