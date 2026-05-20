"use client";
import React, { useState } from 'react';
export default function PaymentsPage() {
  const [selectedWallet, setSelectedWallet] = useState('');
  const [amount, setAmount] = useState('');
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white uppercase">Payments Console</h1>
      <input type="text" placeholder="Worker Wallet" value={selectedWallet} onChange={e => setSelectedWallet(e.target.value)} className="p-3 bg-[#112240] text-white" />
      <input type="number" placeholder="STX Amount" value={amount} onChange={e => setAmount(e.target.value)} className="p-3 bg-[#112240] text-white" />
    </div>
  );
}
