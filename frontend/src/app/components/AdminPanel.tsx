"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useTsaroSafeOwner, useTsaroSafeAdmin } from "@/hooks/useTsaroSafe";
import { getGoodDollarAddress } from "@/lib/constants";
import { Address } from "viem";

export default function AdminPanel() {
    const { address, chain } = useAccount();
    const { owner, isLoading: isLoadingOwner } = useTsaroSafeOwner();
    const { withdrawNative, withdrawERC20, isLoading: isWithdrawing, isConfirmed, error } = useTsaroSafeAdmin();

    const [nativeAmount, setNativeAmount] = useState("");
    const [erc20Amount, setErc20Amount] = useState("");
    const [tokenAddress, setTokenAddress] = useState("");

    const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

    if (isLoadingOwner || !isOwner) {
        return null;
    }

    const handleWithdrawNative = async () => {
        if (!nativeAmount) return;
        try {
            await withdrawNative(BigInt(Math.floor(parseFloat(nativeAmount) * 1e18)));
            setNativeAmount("");
        } catch (err) {
            console.error(err);
        }
    };

    const handleWithdrawERC20 = async () => {
        if (!erc20Amount || !tokenAddress) return;
        try {
            await withdrawERC20(tokenAddress as Address, BigInt(Math.floor(parseFloat(erc20Amount) * 1e18)));
            setErc20Amount("");
        } catch (err) {
            console.error(err);
        }
    };

    const setGdollarAddress = () => {
        if (chain) {
            const gaddr = getGoodDollarAddress(chain.id);
            if (gaddr) setTokenAddress(gaddr);
        }
    };

    return (
        <div className="bg-gray-900 text-white rounded-2xl shadow-xl p-8 border border-white/10 mt-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl">
                    🛡️
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-widest">Admin Control Panel</h2>
                    <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase italic">Authorization: Contract Owner</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Native Withdrawal */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-blue-400">Native CELO Withdrawal</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-500 mb-1">Amount (CELO)</label>
                            <input
                                type="number"
                                value={nativeAmount}
                                onChange={(e) => setNativeAmount(e.target.value)}
                                placeholder="0.0"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>
                        <button
                            onClick={handleWithdrawNative}
                            disabled={isWithdrawing || !nativeAmount}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-2 rounded-lg transition-all uppercase text-xs tracking-widest"
                        >
                            {isWithdrawing ? "Processing..." : "Withdraw CELO"}
                        </button>
                    </div>
                </div>

                {/* ERC20 Withdrawal */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-green-400">ERC20 Withdrawal</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-500 mb-1">Token Address</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tokenAddress}
                                    onChange={(e) => setTokenAddress(e.target.value)}
                                    placeholder="0x..."
                                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-green-600"
                                />
                                <button
                                    onClick={setGdollarAddress}
                                    className="bg-green-600/20 text-green-400 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-600/30 hover:bg-green-600 hover:text-white"
                                >
                                    G$
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-500 mb-1">Amount</label>
                            <input
                                type="number"
                                value={erc20Amount}
                                onChange={(e) => setErc20Amount(e.target.value)}
                                placeholder="0.0"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-600"
                            />
                        </div>
                        <button
                            onClick={handleWithdrawERC20}
                            disabled={isWithdrawing || !erc20Amount || !tokenAddress}
                            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-black py-2 rounded-lg transition-all uppercase text-xs tracking-widest"
                        >
                            {isWithdrawing ? "Processing..." : "Withdraw Token"}
                        </button>
                    </div>
                </div>
            </div>

            {isConfirmed && (
                <div className="mt-6 p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-lg text-center font-bold">
                    Transaction confirmed! Funds have been sent to your wallet.
                </div>
            )}

            {error && (
                <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center font-bold">
                    Error: {error.message}
                </div>
            )}
        </div>
    );
}
