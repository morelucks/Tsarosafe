"use client";
import React, { useState } from 'react';
import { CompanyMember } from '@/types/payroll';
export default function SettingsPage() {
  const [members] = useState<CompanyMember[]>([
    { wallet: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', role: 2 }
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white uppercase">Workspace Settings</h1>
      {members.map(m => <p key={m.wallet} className="text-white">{m.wallet} - Manager</p>)}
    </div>
  );
}
