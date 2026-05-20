"use client";
import React, { useState, useEffect } from 'react';
import { Employee } from '@/types/payroll';

export default function EmployeesPage() {
  const [employees] = useState<Employee[]>([
    { wallet: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', name: 'Alice Cooper', salary: 3500000000, startDate: 125300, active: true, totalReceived: 7000000000, lastPaidAt: 125300 }
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white uppercase">Employees Directory</h1>
      <table className="w-full text-left bg-[#112240] text-white">
        <thead>
          <tr><th className="p-4">Name</th><th className="p-4">Wallet</th><th className="p-4">Salary</th></tr>
        </thead>
        <tbody>
          {employees.map(e => (
            <tr key={e.wallet}>
              <td className="p-4">{e.name}</td>
              <td className="p-4 font-mono">{e.wallet}</td>
              <td className="p-4">{e.salary / 1000000} STX</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
