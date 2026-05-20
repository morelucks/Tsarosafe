"use client";
import React, { useState } from 'react';
export default function AddEmployeeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [wallet, setWallet] = useState('');
  const [name, setName] = useState('');
  const [salary, setSalary] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#112240] p-8 rounded-lg space-y-4">
        <h3 className="text-xl font-bold text-white uppercase">Add Employee</h3>
        <input type="text" placeholder="Wallet Address" value={wallet} onChange={(e) => setWallet(e.target.value)} className="w-full bg-[#0a192f] p-3 text-white" />
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0a192f] p-3 text-white" />
        <input type="number" placeholder="Salary in STX" value={salary} onChange={(e) => setSalary(e.target.value)} className="w-full bg-[#0a192f] p-3 text-white" />
        <button onClick={onClose} className="text-white">Close</button>
      </div>
    </div>
  );
}
