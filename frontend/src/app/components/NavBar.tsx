"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useDisconnect } from "wagmi";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const navLinks = [
    { name: "DASHBOARD", href: "/dashboard" },
    { name: "CREATE GROUP", href: "/create-group" },
    { name: "JOIN GROUP", href: "/join-group" },
    { name: "SAVE SOLO", href: "/save-solo" },
    { name: "SAVINGS", href: "/savings" },
    { name: "INVEST", href: "/invest" },
    { name: "HISTORY", href: "/transactions" },
  ];

  return (
    <nav className="w-full bg-[#0a192f] border-b border-white/10 sticky top-0 z-[100] h-20 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="group">
          <span className="text-2xl font-black text-white tracking-tighter transition-colors group-hover:text-blue-500">
            TSAROSAFE<span className="text-blue-500">.</span>
          </span>
        </Link>

        {/* Desktop Menu - Increased size from 11px to 13px for better readability */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[13px] font-mono font-bold tracking-[0.15em] text-gray-400 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Wallet & Mobile Toggle */}
        <div className="flex items-center gap-6">
          {mounted && isConnected ? (
            /* Address Button: Click to Disconnect */
            <button
              onClick={() => disconnect()}
              className="border border-blue-500 bg-blue-500/5 px-5 py-2.5 font-mono text-sm text-blue-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center gap-2 group"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full group-hover:bg-white animate-pulse"></span>
              <span className="group-hover:hidden">{shortAddress}</span>
              <span className="hidden group-hover:inline text-[10px] uppercase font-black tracking-widest">
                Disconnect
              </span>
            </button>
          ) : mounted ? (
            <button
              onClick={() => open()}
              className="bg-white text-[#0a192f] px-6 py-2.5 text-sm font-black tracking-widest uppercase hover:bg-blue-500 hover:text-white transition-all"
            >
              Connect
            </button>
          ) : (
            <div className="bg-white/10 text-white px-6 py-2.5 text-sm font-black tracking-widest uppercase">
              Loading...
            </div>
          )}

          {/* High-Visibility Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden flex flex-col justify-center items-end gap-1.5 p-2 group"
            aria-label="Open Menu"
          >
            <div className="w-8 h-0.5 bg-white group-hover:bg-blue-500 transition-colors"></div>
            <div className="w-5 h-0.5 bg-white group-hover:bg-blue-500 transition-colors"></div>
            <div className="w-8 h-0.5 bg-white group-hover:bg-blue-500 transition-colors"></div>
          </button>
        </div>
      </div>

      {/* Full-Screen Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0a192f] z-[110] flex flex-col p-8 animate-in fade-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-16">
            <span className="text-2xl font-black text-white tracking-tighter italic">
              MENU
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-12 h-12 flex items-center justify-center border border-white/10 text-white text-2xl"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-5xl font-black text-white tracking-tighter hover:text-blue-500 transition-colors uppercase"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Footer Decor */}
          <div className="mt-auto py-8 border-t border-white/5 font-mono text-[10px] text-gray-600 tracking-widest">
            SECURE ON-CHAIN PROTOCOL // 2025
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
