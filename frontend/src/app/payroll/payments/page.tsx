"use client";
import React, { useState } from 'react';
import { useStacksWallet } from '@/context/StacksWalletContext';
import { payEmployeeTx } from '@/lib/payroll-contract';

export default function PaymentsPage() {
  const { userSession, networkName, network } = useStacksWallet();
  const [selectedWallet, setSelectedWallet] = useState('');
  const [amount, setAmount] = useState('');
  const handlePay = () => {
    payEmployeeTx(
      { userSession, networkName, network },
      1,
      selectedWallet,
      parseFloat(amount) * 1000000,
      'Salary Run',
      'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      'sip-010-trait-ft-standard'
    );
  };
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white uppercase">Payments Console</h1>
      <button onClick={handlePay} className="bg-blue-600 p-3 text-white uppercase font-bold">Disburse</button>
    </div>
  );
}
