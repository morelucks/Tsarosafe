"use client";
import React, { useState } from 'react';
import { PaymentRecord } from '@/types/payroll';
export default function PaymentsPage() {
  const [history] = useState<PaymentRecord[]>([
    { id: 1, companyId: 1, employee: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', amount: 3500000000, paidAt: 125300, memo: 'April 2026 Salary' }
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white uppercase">Payments Console</h1>
      {history.map(h => <p key={h.id} className="text-white">{h.memo} - {h.amount / 1000000} STX</p>)}
    </div>
  );
}
