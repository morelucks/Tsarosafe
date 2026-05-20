"use client";
import React, { useState } from 'react';
import { Employee } from '@/types/payroll';

export default function EmployeesPage() {
  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [editingSalary, setEditingSalary] = useState('');
  const [employees] = useState<Employee[]>([
    { wallet: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', name: 'Alice Cooper', salary: 3500000000, startDate: 125300, active: true, totalReceived: 7000000000, lastPaidAt: 125300 }
  ]);

  return (
    <div className="space-y-6">
      {employees.map(e => (
        <div key={e.wallet} className="text-white p-4 bg-[#112240]">
          {e.name} - {editingWallet === e.wallet ? (
            <input value={editingSalary} onChange={ev => setEditingSalary(ev.target.value)} className="bg-[#0a192f] p-1" />
          ) : (
            <button onClick={() => { setEditingWallet(e.wallet); setEditingSalary((e.salary / 1000000).toString()); }}>Edit</button>
          )}
        </div>
      ))}
    </div>
  );
}
