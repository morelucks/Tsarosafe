"use client";
import React, { useState } from 'react';
export default function PaymentsPage() {
  const [selectedWallet, setSelectedWallet] = useState('');
  const [amount, setAmount] = useState('');
  const handlePrefill = (wallet: string, sal: number) => {
    setSelectedWallet(wallet);
    setAmount((sal / 1000000).toString());
  };
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white uppercase">Payments Console</h1>
      <button onClick={() => handlePrefill('SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 3500000000)} className="text-white">Prefill Alice</button>
    </div>
  );
}
