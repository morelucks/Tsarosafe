"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAccount, useConnect, useConnectors, useSwitchChain } from 'wagmi';

interface MiniPayContextType {
  isMiniPay: boolean;
  isMiniPayConnected: boolean;
  minipayBalance: string;
  autoConnectMiniPay: (force?: boolean) => void;
  isConnecting?: boolean;
  connectError?: string | null;
}

const MiniPayContext = createContext<MiniPayContextType | undefined>(undefined);

export function MiniPayProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, address, chain } = useAccount();
  const { connectAsync } = useConnect();
  const connectors = useConnectors();
  const { switchChainAsync } = useSwitchChain();
  
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [minipayBalance, setMinipayBalance] = useState('0.00');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const autoConnectAttempted = useRef(false);
  const switchAttempted = useRef(false);

  // Detect MiniPay and handle fallback provider edge cases on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ethereum = (window as any).ethereum;
      let isMP = false;

      if (ethereum) {
        if (ethereum.isMiniPay) {
          isMP = true;
        } else if (ethereum.providers && Array.isArray(ethereum.providers)) {
          // Look for MiniPay provider in the multi-provider array
          const mpProvider = ethereum.providers.find((p: any) => p.isMiniPay);
          if (mpProvider) {
            isMP = true;
            try {
              (window as any).ethereum = mpProvider;
            } catch (e) {
              console.warn('Failed to override window.ethereum with MiniPay provider:', e);
            }
          }
        } else if (ethereum.providerMap && typeof ethereum.providerMap.values === 'function') {
          // Look for MiniPay provider in the providerMap
          const providers = Array.from(ethereum.providerMap.values());
          const mpProvider = providers.find((p: any) => (p as any).isMiniPay);
          if (mpProvider) {
            isMP = true;
            try {
              (window as any).ethereum = mpProvider;
            } catch (e) {
              console.warn('Failed to override window.ethereum from providerMap:', e);
            }
          }
        }
      }

      if (!isMP && (window as any).web3?.currentProvider?.isMiniPay) {
        isMP = true;
      }
      if (!isMP && (window as any).celo?.isMiniPay) {
        isMP = true;
      }
      if (!isMP && typeof navigator !== 'undefined' && /MiniPay/i.test(navigator.userAgent)) {
        isMP = true;
      }

      setIsMiniPay(isMP);
      if (isMP) {
        console.log('⚡ MiniPay Integration Booster detected!');
      }
    }
  }, []);

  // Fetch Celo balance when connected inside MiniPay
  useEffect(() => {
    if (isConnected && address && isMiniPay) {
      const fetchBalance = async () => {
        try {
          const res = await fetch('https://forno.celo.org', {
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
        } catch (err) {
          console.error('Failed to fetch MiniPay Celo balance:', err);
        }
      };
      fetchBalance();
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address, isMiniPay]);

  // Auto-connect to MiniPay's injected provider
  const autoConnectMiniPay = async (force: boolean = false) => {
    if (!isMiniPay || isConnected) return;
    if (isConnecting) return;
    if (autoConnectAttempted.current && !force) return;

    const injectedConnector = connectors.find((c) => c.id === 'injected');
    if (!injectedConnector) {
      console.warn('MiniPay auto-connect: Injected connector not found.');
      return;
    }

    autoConnectAttempted.current = true;
    setIsConnecting(true);
    setConnectError(null);

    try {
      console.log('⚡ Attempting MiniPay connection to Celo Mainnet...');
      await connectAsync({ connector: injectedConnector, chainId: 42220 });
      console.log('⚡ MiniPay connected successfully.');
    } catch (err: any) {
      console.error('MiniPay connection error:', err);
      setConnectError(err?.message || String(err));
    } finally {
      setIsConnecting(false);
    }
  };

  // Auto-connect on load when inside MiniPay
  useEffect(() => {
    if (isMiniPay && connectors.length > 0 && !isConnected && !autoConnectAttempted.current && !isConnecting) {
      autoConnectMiniPay();
    }
  }, [isMiniPay, connectors, isConnected, isConnecting]);

  // Handle switching to Celo mainnet gracefully if connected to the wrong chain
  useEffect(() => {
    if (isConnected && chain && chain.id !== 42220 && isMiniPay && !switchAttempted.current) {
      const enforceCelo = async () => {
        switchAttempted.current = true;
        try {
          console.log(`⚡ MiniPay connected to wrong chain (${chain.id}). Switching to Celo Mainnet (42220)...`);
          await switchChainAsync({ chainId: 42220 });
        } catch (err) {
          console.error('Failed to switch chain to Celo Mainnet:', err);
        }
      };
      enforceCelo();
    }
  }, [isConnected, chain, isMiniPay, switchChainAsync]);

  // Reset switch attempt when on the correct chain
  useEffect(() => {
    if (chain && chain.id === 42220) {
      switchAttempted.current = false;
    }
  }, [chain]);

  return (
    <MiniPayContext.Provider value={{ 
      isMiniPay, 
      isMiniPayConnected: isMiniPay && isConnected, 
      minipayBalance, 
      autoConnectMiniPay,
      isConnecting,
      connectError
    }}>
      {children}
    </MiniPayContext.Provider>
  );
}

export function useMiniPay() {
  const context = useContext(MiniPayContext);
  if (!context) throw new Error('useMiniPay must be used inside a MiniPayProvider');
  return context;
}
