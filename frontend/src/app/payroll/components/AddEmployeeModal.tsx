"use client";
import React from 'react';
export default function AddEmployeeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#112240] p-8 rounded-lg">
        <h3 className="text-xl font-bold text-white uppercase">Add Employee</h3>
        <button onClick={onClose} className="text-white mt-4">Close</button>
      </div>
    </div>
  );
}
