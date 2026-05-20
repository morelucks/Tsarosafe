"use client";
import React from 'react';
import { useStacksWallet } from '@/context/StacksWalletContext';
import { revokeRoleTx } from '@/lib/payroll-contract';

export default function SettingsPage() {
  const { userSession, networkName, network } = useStacksWallet();
  const handleRevoke = (wallet: string) => {
    revokeRoleTx({ userSession, networkName, network }, 1, wallet);
  };
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white uppercase">Workspace Settings</h1>
      <button onClick={() => handleRevoke('SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')} className="bg-red-600 p-3 text-white font-bold uppercase">Revoke Alice</button>
    </div>
  );
}
