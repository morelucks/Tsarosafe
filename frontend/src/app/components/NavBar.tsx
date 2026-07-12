"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useDisconnect } from "wagmi";
import NetworkStatus from "./NetworkStatus";
import { useMiniPay } from "@/context/MiniPayContext";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const pathname = usePathname();
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { isMiniPay } = useMiniPay();

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const initialTheme = root.classList.contains("dark") ? "dark" : "light";
    setTheme(initialTheme);
  }, []);

  // Manage body class for MiniPay bottom navigation spacing
  useEffect(() => {
    if (isMiniPay) {
      document.body.classList.add("minipay-active");
    } else {
      document.body.classList.remove("minipay-active");
    }
    return () => {
      document.body.classList.remove("minipay-active");
    };
  }, [isMiniPay]);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.remove("dark");
      localStorage.theme = "light";
      setTheme("light");
    } else {
      root.classList.add("dark");
      localStorage.theme = "dark";
      setTheme("dark");
    }
  };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  // Helper to determine if a link is active
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const mainLinks = [
    { name: "DASHBOARD", href: "/dashboard" },
  ];

  const savingsDropdownLinks = [
    { name: "SAVINGS HUB", href: "/savings", desc: "View all your active group and solo savings" },
    { name: "CREATE GROUP", href: "/create-group", desc: "Start a multi-sig group savings vault" },
    { name: "JOIN GROUP", href: "/join-group", desc: "Enter a code to join a community savings circle" },
    { name: "SAVE SOLO", href: "/save-solo", desc: "Put aside crypto in your personal vault" },
  ];

  const otherLinks = [
    { name: "INVEST", href: "/invest" },
    { name: "PAYROLL", href: "/payroll" },
    { name: "HISTORY", href: "/transactions" },
  ];

  const isTabActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className={`w-full bg-white/80 dark:bg-[#030712]/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-white/5 sticky top-0 z-[100] flex items-center transition-all duration-300 ${
        isMiniPay ? "h-12" : "h-20"
      }`}>
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex justify-between items-center">
          
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-1">
            <span className={`font-black tracking-tight text-slate-900 dark:text-white transition-all ${
              isMiniPay ? "text-sm" : "text-xl md:text-2xl"
            }`}>
              TSARO
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 group-hover:from-blue-300 group-hover:to-indigo-400 transition-all">
                SAFE
              </span>
            </span>
            <span className={`rounded-full bg-blue-500 group-hover:scale-150 transition-all duration-300 ${
              isMiniPay ? "h-1 w-1" : "h-1.5 w-1.5"
            }`}></span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Dashboard */}
            {mainLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 text-[11px] font-bold tracking-[0.15em] transition-all rounded-lg ${
                  isActive(link.href)
                    ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5"
                    : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Savings Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setActiveDropdown("savings")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className={`flex items-center gap-1 px-4 py-2 text-[11px] font-bold tracking-[0.15em] transition-all rounded-lg ${
                  savingsDropdownLinks.some(link => pathname === link.href)
                    ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5"
                    : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                }`}
              >
                SAVINGS
                <svg
                  className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/5 p-2 rounded-xl shadow-lg dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1 z-50">
                <div className="grid grid-cols-1 gap-1">
                  {savingsDropdownLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`flex flex-col p-2.5 rounded-lg transition-all ${
                        pathname === link.href
                          ? "bg-blue-600/10 border-l-2 border-blue-500 pl-2 text-blue-600 dark:text-white"
                          : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="text-[11px] font-bold tracking-wider">{link.name}</span>
                      <span className="text-[9px] text-slate-500 dark:text-gray-500 mt-0.5 font-medium leading-tight">
                        {link.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Other Links */}
            {otherLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 text-[11px] font-bold tracking-[0.15em] transition-all rounded-lg ${
                  isActive(link.href)
                    ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5"
                    : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions (Wallet Connection / Network / Theme Toggle) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/[0.05] text-slate-800 dark:text-gray-300 transition-all active:scale-95 flex items-center justify-center h-8 w-8"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? (
                  <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}

            {mounted && <NetworkStatus />}
            
            {mounted && isMiniPay ? (
              isConnected ? (
                <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-lg text-yellow-500 font-mono text-[9px] shadow-[0_0_10px_rgba(234,179,8,0.05)]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
                  </span>
                  <span>{shortAddress}</span>
                </div>
              ) : (
                <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-wider uppercase animate-pulse">
                  ⚡ MiniPay
                </div>
              )
            ) : mounted && isConnected ? (
              <button
                onClick={() => disconnect()}
                className="flex items-center gap-2 border border-slate-200 dark:border-white/10 hover:border-red-500/30 bg-slate-100 dark:bg-white/5 hover:bg-red-500/10 px-3.5 py-2 rounded-lg font-mono text-xs text-slate-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-all group"
              >
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full group-hover:bg-red-500 transition-colors animate-pulse"></span>
                <span>{shortAddress}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-gray-500 group-hover:text-red-500 dark:group-hover:text-red-400 ml-1">Disconnect</span>
              </button>
            ) : mounted ? (
              <button
                onClick={() => open()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-[0_4px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.4)] active:scale-95"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="bg-white/5 border border-white/5 text-gray-500 px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase">
                Loading...
              </div>
            )}
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden flex flex-col justify-center items-end gap-1.5 p-2 rounded-lg border border-slate-200/50 dark:border-white/5 bg-slate-100 dark:bg-white/[0.02] hover:bg-slate-200 dark:hover:bg-white/[0.05] transition-colors ml-1 ${
                isMiniPay ? "hidden" : ""
              }`}
              aria-label="Open Menu"
            >
              <div className="w-6 h-0.5 bg-slate-800 dark:bg-white"></div>
              <div className="w-4 h-0.5 bg-slate-800 dark:bg-white"></div>
              <div className="w-6 h-0.5 bg-slate-800 dark:bg-white"></div>
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-white/98 dark:bg-[#030712]/98 backdrop-blur-lg z-[110] flex flex-col p-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-white/5 pb-4">
              <span className="text-xs font-mono font-black text-gray-500 tracking-[0.25em] uppercase">
                Tsarosafe Menu
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-red-500/50 text-slate-800 dark:text-white rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 max-h-[75vh] flex flex-col gap-4">
              {/* Dashboard Link */}
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full py-3 px-4 font-mono text-sm font-bold tracking-wider border rounded-xl transition-all ${
                  pathname === "/dashboard"
                    ? "bg-blue-600/10 border-blue-500 text-blue-600 dark:text-white"
                    : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01] text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                DASHBOARD
              </Link>

              {/* Savings section */}
              <div className="border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01] rounded-xl p-3">
                <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 tracking-widest block mb-2 px-1">
                  SAVINGS VAULTS
                </span>
                <div className="flex flex-col gap-2">
                  {savingsDropdownLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`py-2 px-3 text-xs font-bold tracking-wider rounded-lg transition-all ${
                        pathname === link.href
                          ? "bg-blue-600/10 border-l-2 border-blue-500 pl-2 text-blue-600 dark:text-white"
                          : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Other Direct Links */}
              {otherLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full py-3 px-4 font-mono text-sm font-bold tracking-wider border rounded-xl transition-all ${
                    isActive(link.href)
                      ? "bg-blue-600/10 border-blue-500 text-white"
                      : "border-white/5 bg-white/[0.01] text-gray-300 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 flex justify-between font-mono text-[9px] text-gray-500 tracking-wider">
              <span>SECURE ON-CHAIN SAVINGS</span>
              <span>v2.2.0</span>
            </div>
          </div>
        )}
      </nav>

      {/* Sleek Bottom Navigation Tab Bar for MiniPay Webviews */}
      {mounted && isMiniPay && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] h-16 bg-white/95 dark:bg-[#030712]/95 backdrop-blur-lg border-t border-slate-200/50 dark:border-white/5 flex items-center justify-around px-4 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.5)] select-none">
          {/* Dashboard Tab */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center flex-1 py-1.5 text-[9px] font-bold tracking-wider transition-all relative ${
              isTabActive("/dashboard")
                ? "text-amber-500 dark:text-yellow-500 scale-105 font-black"
                : "text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="mt-1 font-mono tracking-wider">Home</span>
            {isTabActive("/dashboard") && (
              <span className="absolute bottom-0 w-1 h-1 rounded-full bg-amber-500 dark:bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            )}
          </Link>

          {/* Savings Tab */}
          <Link
            href="/savings"
            className={`flex flex-col items-center justify-center flex-1 py-1.5 text-[9px] font-bold tracking-wider transition-all relative ${
              isTabActive("/savings")
                ? "text-amber-500 dark:text-yellow-500 scale-105 font-black"
                : "text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="mt-1 font-mono tracking-wider">Savings</span>
            {isTabActive("/savings") && (
              <span className="absolute bottom-0 w-1 h-1 rounded-full bg-amber-500 dark:bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            )}
          </Link>

          {/* Invest Tab */}
          <Link
            href="/invest"
            className={`flex flex-col items-center justify-center flex-1 py-1.5 text-[9px] font-bold tracking-wider transition-all relative ${
              isTabActive("/invest")
                ? "text-amber-500 dark:text-yellow-500 scale-105 font-black"
                : "text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="mt-1 font-mono tracking-wider">Invest</span>
            {isTabActive("/invest") && (
              <span className="absolute bottom-0 w-1 h-1 rounded-full bg-amber-500 dark:bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            )}
          </Link>

          {/* History Tab */}
          <Link
            href="/transactions"
            className={`flex flex-col items-center justify-center flex-1 py-1.5 text-[9px] font-bold tracking-wider transition-all relative ${
              isTabActive("/transactions")
                ? "text-amber-500 dark:text-yellow-500 scale-105 font-black"
                : "text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="mt-1 font-mono tracking-wider">History</span>
            {isTabActive("/transactions") && (
              <span className="absolute bottom-0 w-1 h-1 rounded-full bg-amber-500 dark:bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            )}
          </Link>
        </div>
      )}
    </>
  );
};

export default NavBar;
