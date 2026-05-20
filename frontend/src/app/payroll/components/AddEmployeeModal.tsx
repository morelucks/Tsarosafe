"use client";
import React, { useState } from 'react';
import { useStacksWallet } from '@/context/StacksWalletContext';
import { addEmployeeTx } from '@/lib/payroll-contract';
export default function AddEmployeeModal({ companyId, isOpen, onClose }: { companyId: number, isOpen: boolean, onClose: () => void }) {
  const { userSession, networkName, network } = useStacksWallet();
  const [wallet, setWallet] = useState('');
  const [name, setName] = useState('');
  const [salary, setSalary] = useState('');
  if (!isOpen) return null;
  const handleSubmit = () => {
    addEmployeeTx({ userSession, networkName, network, onFinish: onClose }, companyId, wallet, name, parseFloat(salary) * 1000000);
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#112240] p-8 rounded-lg space-y-4">
        <h3 className="text-xl font-bold text-white uppercase">Add Employee</h3>
        <input type="text" placeholder="Wallet Address" value={wallet} onChange={(e) => setWallet(e.target.value)} className="w-full bg-[#0a192f] p-3 text-white" />
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0a192f] p-3 text-white" />
        <input type="number" placeholder="Salary in STX" value={salary} onChange={(e) => setSalary(e.target.value)} className="w-full bg-[#0a192f] p-3 text-white" />
        <button onClick={handleSubmit} className="w-full bg-blue-600 p-3 text-white uppercase font-bold">Onboard</button>
      </div>
    </div>
  );
}
