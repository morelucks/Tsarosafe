"use client";

import React, { useState, useEffect } from 'react';
import { useStacksWallet } from '@/context/StacksWalletContext';
import { getCompanyIdByOwner, getCompanyDetails, getEmployeeDetails, payEmployeeTx } from '@/lib/payroll-contract';
import { Company, Employee, PaymentRecord } from '@/types/payroll';
import { useNotification } from '@/context/NotificationContext';

export default function PaymentsPage() {
  const { isConnected, userAddress, networkName, network, userSession } = useStacksWallet();
  const { addNotification } = useNotification();
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [tokenAddress, setTokenAddress] = useState('SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE');
  const [tokenName, setTokenName] = useState('sip-010-trait-ft-standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);

  // Seed historic payments list
  const seedPayments = () => {
    return [
      {
        id: 1,
        companyId: 1,
        employee: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        amount: 3500000000,
        paidAt: 125300,
        memo: 'April 2026 Salary Payout',
      },
      {
        id: 2,
        companyId: 1,
        employee: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        amount: 3500000000,
        paidAt: 125420,
        memo: 'May 2026 Salary Payout',
      },
    ];
  };

  // Fetch company info and employees
  const fetchPayrollData = async (address: string) => {
    setIsLoading(true);
    try {
      const companyId = await getCompanyIdByOwner(networkName, address);
      if (companyId) {
        const details = await getCompanyDetails(networkName, companyId);
        if (details) {
          setCompany(details);

          // Get employees list
          const demoWallets = [
            'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            'SP2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            'SP3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          ];
          const list: Employee[] = [];
          for (const w of demoWallets) {
            const empDetails = await getEmployeeDetails(networkName, companyId, w);
            if (empDetails) {
              list.push(empDetails);
            } else {
              list.push({
                wallet: w,
                name: w === 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' ? 'Alice Cooper' : w === 'SP2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' ? 'Bob Dylan' : 'Charlie Brown',
                salary: w === 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' ? 3500000000 : w === 'SP2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' ? 4200000000 : 2800000000,
                startDate: 125300,
                active: true,
                totalReceived: w === 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' ? 7000000000 : 0,
                lastPaidAt: 125300,
              });
            }
          }
          setEmployees(list.filter((e) => e.active));
          setPaymentHistory(seedPayments());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && userAddress) {
      fetchPayrollData(userAddress);
    } else {
      setIsLoading(false);
    }
  }, [isConnected, userAddress, networkName]);

  const handlePayEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !selectedWallet || !amount) {
      addNotification('error', 'Please fill in all required fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      addNotification('error', 'Amount must be positive');
      return;
    }

    const microAmount = Math.round(numAmount * 1000000);

    setIsSubmitting(true);
    try {
      payEmployeeTx(
        {
          userSession,
          networkName,
          network,
          onFinish: (data) => {
            setIsSubmitting(false);
            addNotification('success', `Salary disbursement transaction broadcasted! Tx ID: ${data.txId.slice(0, 10)}...`);
            
            // Log virtual payment in dashboard list
            const newPayment: PaymentRecord = {
              id: Date.now(),
              companyId: company.id,
              employee: selectedWallet,
              amount: microAmount,
              paidAt: 125500, // mock confirmation block
              memo: memo || 'Salary Run',
            };
            setPaymentHistory((prev) => [newPayment, ...prev]);

            // Reset form
            setAmount('');
            setMemo('');
            setSelectedWallet('');
          },
          onCancel: () => {
            setIsSubmitting(false);
            addNotification('info', 'Payment cancelled');
          },
        },
        company.id,
        selectedWallet,
        microAmount,
        memo || 'Decentralized Payout',
        tokenAddress,
        tokenName
      );
    } catch (err: any) {
      console.error(err);
      addNotification('error', err.message || 'Failed to submit payment transaction');
      setIsSubmitting(false);
    }
  };

  const handlePrefillSalary = (walletAddr: string) => {
    setSelectedWallet(walletAddr);
    const emp = employees.find((e) => e.wallet === walletAddr);
    if (emp) {
      setAmount((emp.salary / 1000000).toString());
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20 bg-[#112240] border border-white/10 p-8 rounded-lg max-w-xl mx-auto shadow-2xl">
        <span className="text-5xl block mb-4">🔒</span>
        <h2 className="text-2xl font-bold uppercase text-white mb-4">Authentication Required</h2>
        <p className="text-gray-400 mb-6 text-sm">Please connect your Stacks wallet to process employee payouts.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase">Loading Payments Console...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-20 bg-[#112240] border border-white/10 p-8 rounded-lg max-w-xl mx-auto shadow-2xl">
        <span className="text-5xl block mb-4">⚠️</span>
        <h2 className="text-2xl font-bold uppercase text-white mb-4">No Workspace Found</h2>
        <p className="text-gray-400 mb-6 text-sm">You must register a workspace first to access the payments portal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-4xl font-black text-white uppercase tracking-tight">Payments Console</h1>
        <p className="text-xs text-gray-400 mt-1">
          Execute transparent single payouts to onboarded workers using locked smart contract rates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payout execution block */}
        <div className="lg:col-span-2 bg-[#112240] border border-white/10 p-6 rounded-lg shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

          <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-3 uppercase tracking-wider">
            Disburse Monthly Payout
          </h3>

          <form onSubmit={handlePayEmployee} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Select Employee
                </label>
                <select
                  value={selectedWallet}
                  onChange={(e) => handlePrefillSalary(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-[#0a192f] border border-white/10 text-white text-xs py-3 px-3 focus:outline-none focus:border-blue-500 rounded font-semibold"
                >
                  <option value="">-- Choose active worker --</option>
                  {employees.map((emp) => (
                    <option key={emp.wallet} value={emp.wallet}>
                      {emp.name} ({(emp.salary / 1000000).toLocaleString()} STX)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Payout Amount (STX)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-[#0a192f] border border-white/10 text-white text-xs py-3 px-4 focus:outline-none focus:border-blue-500 rounded font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Memo (Reference ID)
              </label>
              <input
                type="text"
                placeholder="e.g. Salary Payout - Q2 Run"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                maxLength={128}
                disabled={isSubmitting}
                className="w-full bg-[#0a192f] border border-white/10 text-white text-xs py-3 px-4 focus:outline-none focus:border-blue-500 rounded font-semibold"
              />
            </div>

            {/* Token Trait specifications */}
            <div className="border-t border-white/5 pt-4 space-y-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                SIP-010 Token Configuration (Advanced)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Contract Address"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-[#0a192f]/60 border border-white/5 text-gray-400 text-[10px] font-mono py-2 px-3 focus:outline-none focus:border-blue-500 rounded"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Contract Name"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-[#0a192f]/60 border border-white/5 text-gray-400 text-[10px] font-mono py-2 px-3 focus:outline-none focus:border-blue-500 rounded"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedWallet || !amount}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white font-bold py-4 rounded-none transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Broadcasting Tx...
                </>
              ) : (
                'Confirm & Disburse'
              )}
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div className="bg-[#112240] border border-white/10 p-6 rounded-lg shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 uppercase tracking-wider">
              Treasury Overview
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Active Treasury
                </p>
                <p className="font-mono text-xs text-blue-400 break-all select-all">
                  {company.treasury}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Corporate Balance
                </p>
                <p className="text-3xl font-black text-white tracking-tight">
                  15,000.00 STX
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0a192f]/60 p-4 border border-white/5 rounded text-xs text-gray-400 leading-relaxed mt-6">
            <strong>Security Rule:</strong> Only admins and designated managers hold transaction authorization keys to execute payouts on-chain.
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div className="bg-[#112240] border border-white/10 p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-3">
          Historic Payout Receipts
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#0a192f]/40">
                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reference ID</th>
                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Receiver Principal</th>
                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Paid Block</th>
                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tx Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paymentHistory.map((h, i) => (
                <tr key={h.id || i} className="hover:bg-white/[0.01]">
                  <td className="p-4">
                    <span className="font-bold text-white text-sm">{h.memo}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-xs text-gray-400">
                      {h.employee.slice(0, 10)}...{h.employee.slice(-8)}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-white text-sm">
                    {(h.amount / 1000000).toLocaleString(undefined, { minimumFractionDigits: 2 })} STX
                  </td>
                  <td className="p-4 font-mono text-xs text-gray-400">
                    #{h.paidAt}
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-black uppercase tracking-wider rounded">
                      Confirmed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
