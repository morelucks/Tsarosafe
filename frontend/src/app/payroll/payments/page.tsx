"use client";
import React, { useState } from 'react';
export default function PaymentsPage() {
  const [tokenAddress, setTokenAddress] = useState('SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE');
  const [tokenName, setTokenName] = useState('sip-010-trait-ft-standard');
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white uppercase">Payments Console</h1>
      <input value={tokenAddress} onChange={e => setTokenAddress(e.target.value)} className="p-2 bg-[#112240] text-gray-400 text-xs" />
      <input value={tokenName} onChange={e => setTokenName(e.target.value)} className="p-2 bg-[#112240] text-gray-400 text-xs" />
    </div>
  );
}
