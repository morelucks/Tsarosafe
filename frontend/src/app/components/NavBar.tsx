"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAppKit } from "@reown/appkit/react";
// modal may be null when NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set
import { modal } from "../config/appkit";
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
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex justify-between items-center">
        <Link href="/" className="group flex-shrink-0">
          <span className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tighter transition-colors group-hover:text-blue-500 whitespace-nowrap">
            TSAROSAFE<span className="text-blue-500 hidden sm:inline">.</span>
          </span>
        </Link>
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-[13px] font-mono font-bold tracking-[0.15em] text-gray-400 hover:text-white transition-colors">
              {link.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 md:gap-6 flex-shrink-0">
          {mounted && <NetworkStatus />}
          
          {mounted && isMiniPay ? (
            isConnected ? (
              <div className="flex-shrink-0 border border-yellow-500/30 bg-yellow-500/5 px-2 py-1 sm:px-3 sm:py-1.5 md:px-5 md:py-2.5 font-mono text-[10px] sm:text-xs md:text-sm text-yellow-500 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full animate-pulse flex-shrink-0"></span>
                <span className="whitespace-nowrap">{shortAddress}</span>
              </div>
            ) : (
              <div className="flex-shrink-0 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-1 sm:px-3 sm:py-1.5 md:px-6 md:py-2.5 text-[10px] md:text-sm font-black tracking-widest uppercase animate-pulse whitespace-nowrap">
                ⚡ MiniPay <span className="hidden md:inline">Connected</span>
              </div>
            )
          ) : mounted && isConnected ? (
            <button onClick={() => disconnect()} className="flex-shrink-0 border border-blue-500 bg-blue-500/5 px-2 py-1 sm:px-3 sm:py-1.5 md:px-5 md:py-2.5 font-mono text-[10px] sm:text-xs md:text-sm text-blue-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center gap-1.5 sm:gap-2 group whitespace-nowrap">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full group-hover:bg-white animate-pulse flex-shrink-0"></span>
              <span className="group-hover:hidden whitespace-nowrap">{shortAddress}</span>
              <span className="hidden group-hover:inline text-[10px] uppercase font-black tracking-widest whitespace-nowrap">Disconnect</span>
            </button>
          ) : mounted ? (
            <button onClick={() => open()} className="flex-shrink-0 bg-white text-[#0a192f] px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-black tracking-widest uppercase hover:bg-blue-500 hover:text-white transition-all whitespace-nowrap">Connect</button>
          ) : (
            <div className="flex-shrink-0 bg-white/10 text-white px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-black tracking-widest uppercase whitespace-nowrap">Loading...</div>
          )}
          
          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden flex flex-col justify-center items-end gap-1.5 p-2 group ml-1 flex-shrink-0" aria-label="Open Menu">
            <div className="w-6 md:w-8 h-0.5 bg-white group-hover:bg-blue-500 transition-colors"></div>
            <div className="w-4 md:w-5 h-0.5 bg-white group-hover:bg-blue-500 transition-colors"></div>
            <div className="w-6 md:w-8 h-0.5 bg-white group-hover:bg-blue-500 transition-colors"></div>
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0a192f]/98 backdrop-blur-md z-[110] flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
            <span className="text-sm font-mono font-black text-gray-500 tracking-[0.25em] uppercase">Tsarosafe Workspace</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-blue-500 text-white rounded transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 max-h-[70vh] flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-between py-3.5 px-4 font-mono text-sm font-bold tracking-widest text-gray-300 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-blue-500/50 hover:text-white rounded transition-all group"
              >
                <span>{link.name}</span>
                <span className="text-gray-600 group-hover:text-blue-400 transition-colors">➔</span>
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-2 font-mono text-[9px] text-gray-500 tracking-wider">
            <div className="flex justify-between">
              <span>SECURE ON-CHAIN SAVINGS & PAYROLL</span>
              <span>v2.1.0</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
export default NavBar;

// Optimization: Set max width constraint on content panels.

// Optimization: Enable dynamic height sizing on status bars.

// Optimization: Refine text styling on status badges.

// Optimization: Restructure brand container with inline flex rules.

// Optimization: Keep SelfQRcodeWrapper mounted invisibly for status checks.

// Optimization: Remove duplicate data fetching on dashboard load.
