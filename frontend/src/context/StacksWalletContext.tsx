"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network';

interface StacksWalletContextType {
  userSession: UserSession;
  userAddress: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  network: StacksMainnet | StacksTestnet | StacksMocknet;
  networkName: 'mainnet' | 'testnet' | 'devnet';
  setNetworkName: (name: 'mainnet' | 'testnet' | 'devnet') => void;
}

const StacksWalletContext = createContext<StacksWalletContextType | undefined>(undefined);

export function StacksWalletProvider({ children }: { children: React.ReactNode }) {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [networkName, setNetworkNameState] = useState<'mainnet' | 'testnet' | 'devnet'>('mainnet');

  // Stacks App config
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });

  // Stacks network mapping
  const getNetworkInstance = (name: 'mainnet' | 'testnet' | 'devnet') => {
    switch (name) {
      case 'testnet':
        return new StacksTestnet();
      case 'devnet':
        return new StacksMocknet({ url: 'http://localhost:3999' });
      case 'mainnet':
      default:
        return new StacksMainnet();
    }
  };

  const network = getNetworkInstance(networkName);

  const setNetworkName = (name: 'mainnet' | 'testnet' | 'devnet') => {
    setNetworkNameState(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('stacks-network-pref', name);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNetwork = localStorage.getItem('stacks-network-pref') as 'mainnet' | 'testnet' | 'devnet';
      if (savedNetwork) {
        setNetworkNameState(savedNetwork);
      }
    }

    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const address = userData.profile.stxAddress.mainnet; // fallback or testnet depending on preferred network
      setUserAddress(address);
    }
  }, []);

  const connect = () => {
    showConnect({
      appDetails: {
        name: 'Tsarosafe Payroll',
        icon: window.location.origin + '/favicon.ico',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData();
        // Stacks connection finishes, save the user's STX address
        const address = networkName === 'mainnet' 
          ? userData.profile.stxAddress.mainnet 
          : userData.profile.stxAddress.testnet;
        setUserAddress(address);
      },
      onCancel: () => {
        console.log('Stacks Wallet connection cancelled.');
      },
      userSession,
    });
  };

  const disconnect = () => {
    userSession.signUserOut();
    setUserAddress(null);
  };

  return (
    <StacksWalletContext.Provider
      value={{
        userSession,
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
