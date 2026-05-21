"use client";
import React, { createContext, useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useConnectors } from 'wagmi';

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
  const autoConnectMiniPay = () => {};
  return (
    <MiniPayContext.Provider value={{ isMiniPay, isMiniPayConnected: isMiniPay && isConnected, minipayBalance: '0.00', autoConnectMiniPay }}>
      {children}
    </MiniPayContext.Provider>
  );
}
