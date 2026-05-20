"use client";
import React, { useState } from 'react';
export default function RegisterCompany({ onSuccess }: { onSuccess: (id: number) => void }) {
  return (
    <div className="max-w-xl mx-auto bg-[#112240] p-8 rounded-lg shadow-2xl">
      <h2 className="text-3xl font-black text-white uppercase mb-4">Register Workspace</h2>
      <p className="text-gray-400 text-sm">Create a corporate space on Stacks blockchain.</p>
    </div>
  );
}
