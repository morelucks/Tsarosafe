"use client";
import React, { useState } from 'react';
export default function SettingsPage() {
  const [newMember, setNewMember] = useState('');
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-white uppercase">Workspace Settings</h1>
      <input type="text" placeholder="Member Wallet" value={newMember} onChange={e => setNewMember(e.target.value)} className="p-3 bg-[#112240] text-white" />
    </div>
  );
}
