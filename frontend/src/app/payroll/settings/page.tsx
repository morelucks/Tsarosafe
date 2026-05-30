"use client";

import React, { useState, useEffect } from 'react';
import { useStacksWallet } from '@/context/StacksWalletContext';
import { getCompanyIdByOwner, getCompanyDetails, getMemberRole, assignRoleTx, revokeRoleTx } from '@/lib/payroll-contract';
import { Company, CompanyMember, UserRole } from '@/types/payroll';
import { useNotification } from '@/context/NotificationContext';
import { ROLE_NAMES } from '@/lib/payroll-constants';

export default function SettingsPage() {
  const { isConnected, userAddress, networkName, network, userSession } = useStacksWallet();
  const { addNotification } = useNotification();
  const [company, setCompany] = useState<Company | null>(null);
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for assigning role
  const [newMember, setNewMember] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(3); // Viewer default
  const [isAssigning, setIsAssigning] = useState(false);

  const seedMembers = (ownerAddress: string) => {
    return [
      { wallet: ownerAddress, role: 1 as UserRole }, // Owner is Admin
      { wallet: 'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', role: 2 as UserRole }, // Manager
      { wallet: 'SP2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', role: 3 as UserRole }, // Viewer
    ];
  };

  const fetchSettingsData = async (address: string) => {
    setIsLoading(true);
    try {
      const companyId = await getCompanyIdByOwner(networkName, address);
      if (companyId) {
        const details = await getCompanyDetails(networkName, companyId);
        if (details) {
          setCompany(details);

          // Get role assignments dynamically (fallback to mock seeds for visual UI)
          const fetchedMembers: CompanyMember[] = [];
          const seeded = seedMembers(address);
          for (const s of seeded) {
            const role = await getMemberRole(networkName, companyId, s.wallet);
            if (role) {
              fetchedMembers.push({ wallet: s.wallet, role });
            } else {
              fetchedMembers.push(s);
            }
          }
          setMembers(fetchedMembers);
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
      fetchSettingsData(userAddress);
    } else {
      setIsLoading(false);
    }
  }, [isConnected, userAddress, networkName]);

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !newMember) {
      addNotification('error', 'Please input a member wallet principal');
      return;
    }

    setIsAssigning(true);
    try {
      assignRoleTx(
        {
          userSession,
          networkName,
          network,
          onFinish: (data) => {
            setIsAssigning(false);
            addNotification('success', `Role assigned successfully! Tx ID: ${data.txId.slice(0, 10)}...`);
            
            // Optimistically update list
            const existing = members.find((m) => m.wallet === newMember);
            if (existing) {
              setMembers(members.map((m) => (m.wallet === newMember ? { ...m, role: newRole } : m)));
            } else {
              setMembers([...members, { wallet: newMember, role: newRole }]);
            }
            setNewMember('');
          },
          onCancel: () => {
            setIsAssigning(false);
            addNotification('info', 'Assignment cancelled');
          },
        },
        company.id,
        newMember,
        newRole
      );
    } catch (err: any) {
      console.error(err);
      addNotification('error', err.message || 'Failed to assign role');
      setIsAssigning(false);
    }
  };

  const handleRevokeRole = async (memberWallet: string) => {
    if (!company) return;

    if (memberWallet === userAddress) {
      addNotification('error', "You cannot revoke your own admin rights!");
      return;
    }

    try {
      revokeRoleTx(
        {
          userSession,
          networkName,
          network,
          onFinish: (data) => {
            addNotification('success', `Role revoked! Tx ID: ${data.txId.slice(0, 10)}...`);
            setMembers(members.filter((m) => m.wallet !== memberWallet));
          },
          onCancel: () => {
            addNotification('info', 'Revocation cancelled');
          },
        },
        company.id,
        memberWallet
      );
    } catch (err: any) {
      addNotification('error', err.message || 'Failed to revoke role');
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20 bg-[#112240] border border-white/10 p-8 rounded-lg max-w-xl mx-auto shadow-2xl">
        <span className="text-5xl block mb-4">🔒</span>
        <h2 className="text-2xl font-bold uppercase text-white mb-4">Authentication Required</h2>
        <p className="text-gray-400 mb-6 text-sm">Please connect your Stacks wallet to access workspace settings.</p>
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
        <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase">Loading settings details...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-20 bg-[#112240] border border-white/10 p-8 rounded-lg max-w-xl mx-auto shadow-2xl">
        <span className="text-5xl block mb-4">⚠️</span>
        <h2 className="text-2xl font-bold uppercase text-white mb-4">No Workspace Found</h2>
        <p className="text-gray-400 mb-6 text-sm">You must register a company workspace to view administrative settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-4xl font-black text-white uppercase tracking-tight">Workspace Settings</h1>
        <p className="text-xs text-gray-400 mt-1">
          Administer role-based permissions, configure company boundaries and revoke credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Role assignments form */}
        <div className="lg:col-span-2 bg-[#112240] border border-white/10 p-6 rounded-lg shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

          <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-3 uppercase tracking-wider">
            Assign Team Permissions
          </h3>

          <form onSubmit={handleAssignRole} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Member Wallet Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. SP34MN3DMM..."
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  disabled={isAssigning}
                  className="w-full bg-[#0a192f] border border-white/10 text-white text-xs py-3 px-4 focus:outline-none focus:border-blue-500 rounded font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Permission Level
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(parseInt(e.target.value) as UserRole)}
                  disabled={isAssigning}
                  className="w-full bg-[#0a192f] border border-white/10 text-white text-xs py-3 px-3 focus:outline-none focus:border-blue-500 rounded font-semibold"
                >
                  <option value={1}>Admin (Full Access)</option>
                  <option value={2}>Manager (Onboard & Pay)</option>
                  <option value={3}>Viewer (ReadOnly Audit)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAssigning || !newMember}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white font-bold py-4 rounded-none transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAssigning ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Assigning Role...
                </>
              ) : (
                'Grant Role Authority'
              )}
            </button>
          </form>
        </div>

        {/* Contract Limits Info Panel */}
        <div className="bg-[#112240] border border-white/10 p-6 rounded-lg shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 uppercase tracking-wider">
            Clarity Contract Parameters
          </h3>

          <div className="space-y-4 text-sm text-gray-400">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>Max Onboard Limit:</span>
              <span className="font-bold text-white">200 Employees</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>Authorized Roles:</span>
              <span className="font-bold text-white">Admin, Manager, Viewer</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>Standard Decimals:</span>
              <span className="font-bold text-white">6 (STX Standard)</span>
            </div>
            <div className="flex justify-between">
              <span>Blockchain Layer:</span>
              <span className="font-bold text-white">Stacks L2 (Bitcoin Anchored)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Authorized team list */}
      <div className="bg-[#112240] border border-white/10 p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider border-b border-white/10 pb-3">
          Authorized Team Space Members
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#0a192f]/40">
                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Member Wallet</th>
                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Role</th>
                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map((m, i) => (
                <tr key={m.wallet || i} className="hover:bg-white/[0.01]">
                  <td className="p-4">
                    <span className="font-mono text-xs text-white">
                      {m.wallet}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-gray-300 text-sm">
                      {ROLE_NAMES[m.role as keyof typeof ROLE_NAMES] || 'Viewer'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-black uppercase tracking-wider rounded">
                      Authorized
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {m.wallet !== userAddress ? (
                      <button
                        onClick={() => handleRevokeRole(m.wallet)}
                        className="text-red-400 hover:text-red-300 font-bold text-[10px] uppercase tracking-wider py-1 px-3 border border-red-500/20 bg-red-950/20 rounded transition-all cursor-pointer"
                      >
                        Revoke Access
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider italic">
                        Owner (Primary Admin)
                      </span>
                    )}
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
