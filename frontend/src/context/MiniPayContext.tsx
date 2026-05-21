"use client";
import React, { createContext } from 'react';
interface MiniPayContextType {
  isMiniPay: boolean;
  isMiniPayConnected: boolean;
  minipayBalance: string;
  autoConnectMiniPay: () => void;
}
const MiniPayContext = createContext<MiniPayContextType | undefined>(undefined);
