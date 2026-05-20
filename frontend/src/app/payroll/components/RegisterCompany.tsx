"use client";
import React, { useState } from 'react';
export default function RegisterCompany({ onSuccess }: { onSuccess: (id: number) => void }) {
  const [name, setName] = useState('');
  const [treasury, setTreasury] = useState('');
  return (
    <div className="max-w-xl mx-auto bg-[#112240] p-8 rounded-lg shadow-2xl">
      <h2 className="text-3xl font-black text-white uppercase mb-6">Register Workspace</h2>
      <div className="space-y-4">
        <input type="text" placeholder="Company Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0a192f] p-3 text-white rounded border border-white/10" />
        <input type="text" placeholder="Treasury Address" value={treasury} onChange={(e) => setTreasury(e.target.value)} className="w-full bg-[#0a192f] p-3 text-white rounded border border-white/10" />
      </div>
    </div>
  );
}
