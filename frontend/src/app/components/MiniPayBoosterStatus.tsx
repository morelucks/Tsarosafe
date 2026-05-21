"use client";
import React from 'react';
import { useMiniPay } from '@/context/MiniPayContext';
export default function MiniPayBoosterStatus() {
  const { isMiniPay } = useMiniPay();
  if (!isMiniPay) return null;
  return <div>Booster Active</div>;
}
