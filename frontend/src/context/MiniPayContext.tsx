"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useConnectors } from 'wagmi';
import { celo } from 'wagmi/chains';
import { useNotification } from './NotificationContext';

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
  const { addNotification } = useNotification();
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [minipayBalance, setMinipayBalance] = useState('0.00');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ethereum = (window as any).ethereum;
      const isMP = !!(ethereum?.isMiniPay || (window as any).web3?.currentProvider?.isMiniPay);
      setIsMiniPay(isMP);
    }
  }, []);

  useEffect(() => {
    if (isConnected && address && isMiniPay) {
      const fetchBalance = async () => {
        try {
          const res = await fetch(`https://forno.celo.org`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'eth_getBalance',
              params: [address, 'latest'],
            }),
          });
          const data = await res.json();
          if (data.result) {
            const wei = BigInt(data.result);
            const celoVal = Number(wei) / 1e18;
            setMinipayBalance(celoVal.toFixed(2));
          }
        } catch {}
      };
      fetchBalance();
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address, isMiniPay]);

  const autoConnectMiniPay = () => {
    if (!isMiniPay || isConnected) return;
    const injectedConnector = connectors.find((c) => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector, chainId: celo.id });
    }
  };

  useEffect(() => {
    if (isMiniPay && connectors.length > 0 && !isConnected) {
      autoConnectMiniPay();
    }
  }, [isMiniPay, connectors, isConnected]);

  return (
    <MiniPayContext.Provider value={{ isMiniPay, isMiniPayConnected: isMiniPay && isConnected, minipayBalance, autoConnectMiniPay }}>
      {children}
    </MiniPayContext.Provider>
  );
}

export function useMiniPay() {
  const context = useContext(MiniPayContext);
  if (!context) throw new Error('useMiniPay must be used inside a MiniPayProvider');
  return context;
}
