"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useDisconnect } from "wagmi";
import NetworkStatus from "./NetworkStatus";
import { useMiniPay } from "@/context/MiniPayContext";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { isMiniPay } = useMiniPay();

  useEffect(() => { setMounted(true); }, []);

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  const navLinks = [
    { name: "DASHBOARD", href: "/dashboard" },
    { name: "CREATE GROUP", href: "/create-group" },
    { name: "JOIN GROUP", href: "/join-group" },
    { name: "SAVE SOLO", href: "/save-solo" },
    { name: "SAVINGS", href: "/savings" },
    { name: "INVEST", href: "/invest" },
    { name: "PAYROLL", href: "/payroll" },
    { name: "HISTORY", href: "/transactions" },
  ];

  return (
    <nav className="w-full bg-[#0a192f] border-b border-white/10 sticky top-0 z-[100] h-20 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
        <Link href="/" className="group">
          <span className="text-2xl font-black text-white tracking-tighter transition-colors group-hover:text-blue-500">
            TSAROSAFE<span className="text-blue-500">.</span>
          </span>
        </Link>
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-[13px] font-mono font-bold tracking-[0.15em] text-gray-400 hover:text-white transition-colors">
              {link.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-6">
          {mounted && <NetworkStatus />}
          
          {mounted && isMiniPay ? (
            isConnected ? (
              <div onClick={() => disconnect()} className="border border-yellow-500/30 bg-yellow-500/5 px-5 py-2.5 font-mono text-sm text-yellow-500 flex items-center gap-2 cursor-pointer">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                <span>{shortAddress}</span>
              </div>
            ) : (
              <button onClick={() => open()} className="bg-yellow-500 text-[#0a192f] px-6 py-2.5 text-sm font-black tracking-widest uppercase hover:bg-yellow-400 transition-all">
                Connect MiniPay
              </button>
            )
          ) : mounted && isConnected ? (
            <button onClick={() => disconnect()} className="border border-blue-500 bg-blue-500/5 px-5 py-2.5 font-mono text-sm text-blue-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center gap-2 group">
              <span className="w-2 h-2 bg-blue-500 rounded-full group-hover:bg-white animate-pulse"></span>
              <span className="group-hover:hidden">{shortAddress}</span>
              <span className="hidden group-hover:inline text-[10px] uppercase font-black tracking-widest">Disconnect</span>
            </button>
          ) : mounted ? (
            <button onClick={() => open()} className="bg-white text-[#0a192f] px-6 py-2.5 text-sm font-black tracking-widest uppercase hover:bg-blue-500 hover:text-white transition-all">Connect</button>
          ) : (
            <div className="bg-white/10 text-white px-6 py-2.5 text-sm font-black tracking-widest uppercase">Loading...</div>
          )}
          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden flex flex-col justify-center items-end gap-1.5 p-2 group" aria-label="Open Menu">
            <div className="w-8 h-0.5 bg-white group-hover:bg-blue-500 transition-colors"></div>
            <div className="w-5 h-0.5 bg-white group-hover:bg-blue-500 transition-colors"></div>
            <div className="w-8 h-0.5 bg-white group-hover:bg-blue-500 transition-colors"></div>
          </button>
        </div>
      </div>
    </nav>
  );
};
export default NavBar;
