"use client";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

export default function NetworkStatus() {
    const { chain, isConnected } = useAccount();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isConnected || !chain) return null;

    const isBase = chain.id === 8453 || chain.id === 84532;
    const isCelo = chain.id === 42220 || chain.id === 44787;

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isBase
                ? "bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                : isCelo
                    ? "bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                    : "bg-gray-500/10 border-gray-500/20 text-gray-400"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isBase ? "bg-blue-500" : isCelo ? "bg-green-500" : "bg-gray-500"
                }`}></span>
            {chain.name}
        </div>
    );
}
