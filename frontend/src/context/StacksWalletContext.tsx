"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { StacksNetwork, STACKS_MAINNET, STACKS_TESTNET, STACKS_DEVNET } from '@stacks/network';

interface StacksWalletContextType {
  userSession: any;
  userAddress: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  network: StacksNetwork;
  networkName: 'mainnet' | 'testnet' | 'devnet';
  setNetworkName: (name: 'mainnet' | 'testnet' | 'devnet') => void;
}

const StacksWalletContext = createContext<StacksWalletContextType | undefined>(undefined);

export function StacksWalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [networkName, setNetworkNameState] = useState<'mainnet' | 'testnet' | 'devnet'>('mainnet');
  const userSessionRef = useRef<any>(null);

  // Only initialize @stacks/connect on the client side
  useEffect(() => {
    const init = async () => {
      try {
        const { AppConfig, UserSession } = await import('@stacks/connect');
        const appConfig = new AppConfig(['store_write', 'publish_data']);
        userSessionRef.current = new UserSession({ appConfig });

        // Restore saved network preference
        const savedNetwork = localStorage.getItem('stacks-network-pref') as 'mainnet' | 'testnet' | 'devnet';
        if (savedNetwork) {
          setNetworkNameState(savedNetwork);
        }

        // Check if user is already signed in
        if (userSessionRef.current.isUserSignedIn()) {
          const userData = userSessionRef.current.loadUserData();
          const address = userData.profile.stxAddress.mainnet;
          setUserAddress(address);
        }
      } catch (err) {
        console.error('Failed to initialize Stacks SDK:', err);
      }
      setMounted(true);
    };
    init();
  }, []);

  // Stacks network mapping
  const getNetworkInstance = (name: 'mainnet' | 'testnet' | 'devnet'): StacksNetwork => {
    switch (name) {
      case 'testnet':
        return STACKS_TESTNET;
      case 'devnet':
        return STACKS_DEVNET;
      case 'mainnet':
      default:
        return STACKS_MAINNET;
    }
  };

  const network = getNetworkInstance(networkName);

  const setNetworkName = (name: 'mainnet' | 'testnet' | 'devnet') => {
    setNetworkNameState(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('stacks-network-pref', name);
    }
  };

  const connect = () => {
    if (!userSessionRef.current || typeof window === 'undefined') return;

    import('@stacks/connect').then(({ showConnect }) => {
      showConnect({
        appDetails: {
          name: 'Tsarosafe Payroll',
          icon: window.location.origin + '/favicon.ico',
        },
        redirectTo: '/',
        onFinish: () => {
          const userData = userSessionRef.current.loadUserData();
          // Stacks connection finishes, save the user's STX address
          const address = networkName === 'mainnet'
            ? userData.profile.stxAddress.mainnet
            : userData.profile.stxAddress.testnet;
          setUserAddress(address);
        },
        onCancel: () => {
          console.log('Stacks Wallet connection cancelled.');
        },
        userSession: userSessionRef.current,
      });
    });
  };

  const disconnect = () => {
    if (userSessionRef.current) {
      userSessionRef.current.signUserOut();
    }
    setUserAddress(null);
  };

  return (
    <StacksWalletContext.Provider
      value={{
        userSession: userSessionRef.current,
        userAddress,
        isConnected: !!userAddress,
        connect,
        disconnect,
        network,
        networkName,
        setNetworkName,
      }}
    >
      {children}
    </StacksWalletContext.Provider>
  );
}

export function useStacksWallet() {
  const context = useContext(StacksWalletContext);
  if (!context) {
    throw new Error('useStacksWallet must be used within a StacksWalletProvider');
  }
  return context;
}
