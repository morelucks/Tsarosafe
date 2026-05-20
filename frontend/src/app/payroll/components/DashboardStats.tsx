"use client";
import React from 'react';
import { Company } from '@/types/payroll';
export default function DashboardStats({ company }: { company: Company }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-[#112240] p-6 rounded-lg text-white">Total Paid: {company.totalPaid} micro-STX</div>
    </div>
  );
}
