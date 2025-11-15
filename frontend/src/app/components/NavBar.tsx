// "use client";
// import Link from "next/link";
// import { useCallback, useEffect, useMemo, useState } from "react";

// type EthereumProvider = {
//   request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
//   on?: (event: string, handler: (...args: unknown[]) => void) => void;
//   removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
// };

// const NavBar = () => {
//   const [account, setAccount] = useState<string | null>(null);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const ethereum = useMemo<EthereumProvider | undefined>(() => {
//     if (typeof window === "undefined") return undefined;
//     const w = window as Window & { ethereum?: EthereumProvider };
//     return w.ethereum;
//   }, []);

//   const shortAddress = useMemo(() => {
//     if (!account) return "";
//     return account.slice(0, 6) + "…" + account.slice(-4);
//   }, [account]);

//   const handleConnect = useCallback(async () => {
//     if (!ethereum) {
//       alert("No Ethereum provider found. Install MetaMask.");
//       return;
//     }
//     try {
//       setIsConnecting(true);
//       const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
//       setAccount(accounts?.[0] ?? null);
//     } catch (err) {
//       console.error("Wallet connection failed", err);
//     } finally {
//       setIsConnecting(false);
//     }
//   }, [ethereum]);

//   useEffect(() => {
//     if (!ethereum?.on) return;
//     const handleAccountsChanged = (...args: unknown[]) => {
//       const accounts = (args[0] as string[]) || [];
//       setAccount(accounts?.[0] ?? null);
//     };
//     ethereum
//       .request({ method: "eth_accounts" })
//       .then((acc) => setAccount((acc as string[])?.[0] ?? null))
//       .catch(() => {});
//     if (ethereum && ethereum.on) {
//       ethereum.on("accountsChanged", handleAccountsChanged);
//     }
//     return () => {
//       if (ethereum?.removeListener) {
//         ethereum.removeListener("accountsChanged", handleAccountsChanged);
//       }
//     };
//   }, [ethereum]);

//   return (
//     <div>
//       <nav className="bg-gradient-to-r from-[#0a1929] via-[#0d2137] to-[#0a1929] border-b border-sky-500/20 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
//         <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
//           {/* Logo */}
//           <Link 
//             className="flex items-center space-x-3 rtl:space-x-reverse"
//             href={"/"}>
//             <span className="self-center text-2xl font-bold text-white hover:text-sky-400 transition-colors duration-200">
//               Tsarosafe
//             </span>
//           </Link>

//           {/* Right side: Connect Button + Mobile Menu Toggle */}
//           <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
//             {/* Connect Wallet Button */}
//             <button
//               onClick={handleConnect}
//               type="button"
//               className="rounded-full bg-gradient-to-r from-sky-600 to-sky-500 text-white px-6 py-2.5 mr-4 font-semibold hover:from-sky-500 hover:to-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
//               disabled={isConnecting}
//             >
//               <span className="flex items-center gap-2">
//                 {account ? (
//                   <>
//                     <span className="w-2 h-2 bg-green-400 rounded-full"></span>
//                     {shortAddress}
//                   </>
//                 ) : isConnecting ? (
//                   <>
//                     <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Connecting…
//                   </>
//                 ) : (
//                   "Connect Wallet"
//                 )}
//               </span>
//             </button>

//             {/* Mobile Menu Toggle */}
//             <button
//               type="button"
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               className="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-400 rounded-lg md:hidden hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-200"
//               aria-controls="navbar-user"
//               aria-expanded={isMobileMenuOpen}
//             >
//               <span className="sr-only">Open main menu</span>
//               {isMobileMenuOpen ? (
//                 <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
//                   <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
//                 </svg>
//               ) : (
//                 <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
//                   <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
//                 </svg>
//               )}
//             </button>
//           </div>

//           {/* Navigation Links */}
//           <div
//             className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
//               isMobileMenuOpen ? "block" : "hidden"
//             }`}
//             id="navbar-user"
//           >
//             <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-700 rounded-lg bg-gray-900 md:space-x-2 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
//               <li>
//                 <Link 
//                   href={"/dashboard"} 
//                   onClick={() => setIsMobileMenuOpen(false)}
//                   className="block py-2.5 px-4 text-gray-300 rounded-lg hover:text-sky-400 transition-colors duration-200 md:p-2">
//                   Dashboard
//                 </Link>
//               </li>
              
//               <li>
//                 <Link 
//                   href={'/create-group'} 
//                   onClick={() => setIsMobileMenuOpen(false)}
//                   className="block py-2.5 px-4 text-gray-300 rounded-lg hover:text-sky-400 transition-colors duration-200 md:p-2">
//                   Create Group
//                 </Link>
//               </li>

//               <li>
//                 <Link 
//                   href={"/join-group"} 
//                   onClick={() => setIsMobileMenuOpen(false)}
//                   className="block py-2.5 px-4 text-gray-300 rounded-lg hover:text-sky-400 transition-colors duration-200 md:p-2">
//                   Join Group
//                 </Link>
//               </li>

//               <li>
//                 <Link 
//                   href={"/save-solo"} 
//                   onClick={() => setIsMobileMenuOpen(false)}
//                   className="block py-2.5 px-4 text-gray-300 rounded-lg hover:text-sky-400 transition-colors duration-200 md:p-2">
//                   Save Solo
//                 </Link>
//               </li>

//               <li>
//                 <Link 
//                   href={"/savings"} 
//                   onClick={() => setIsMobileMenuOpen(false)}
//                   className="block py-2.5 px-4 text-gray-300 rounded-lg hover:text-sky-400 transition-colors duration-200 md:p-2">
//                   Savings
//                 </Link>
//               </li>
              
//               <li>
//                 <Link
//                   href={"/invest"}
//                   onClick={() => setIsMobileMenuOpen(false)}
//                   className="block py-2.5 px-4 text-gray-300 rounded-lg hover:text-sky-400 transition-colors duration-200 md:p-2">
//                   Invest
//                 </Link>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </nav>
//     </div>
//   );
// };

// export default NavBar;


"use client";
import Link from "next/link";
import { useState } from "react";
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useDisconnect } from 'wagmi'

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const shortAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}` 
    : ''

  return (
    <div>
      <nav className="bg-gradient-to-r from-[#0a1929] via-[#0d2137] to-[#0a1929] border-b border-sky-500/20 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link 
            className="flex items-center space-x-3 rtl:space-x-reverse"
            href={"/"}>
            <span className="self-center text-2xl font-bold text-white hover:text-sky-400 transition-colors duration-200">
              Tsarosafe
            </span>
          </Link>

          <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            {isConnected ? (
              <div className="relative group mr-4">
                <button
                  className="rounded-full bg-gradient-to-r from-sky-600 to-sky-500 text-white px-6 py-2.5 font-semibold hover:from-sky-500 hover:to-sky-400 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  {shortAddress}
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={() => open({ view: 'Account' })}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    View Account
                  </button>
                  <button
                    onClick={() => disconnect()}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => open()}
                type="button"
                className="rounded-full bg-gradient-to-r from-sky-600 to-sky-500 text-white px-6 py-2.5 mr-4 font-semibold hover:from-sky-500 hover:to-sky-400 transition-all duration-200"
              >
                Connect Wallet
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-400 rounded-lg md:hidden hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
                </svg>
              )}
            </button>
          </div>

          <div
            className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
              isMobileMenuOpen ? "block" : "hidden"
            }`}
          >
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-700 rounded-lg bg-gray-900 md:space-x-2 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
              <li>
                <Link 
                  href={"/dashboard"} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2.5 px-4 text-gray-300 rounded-lg hover:text-sky-400 transition-colors duration-200 md:p-2">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href={'/create-group'} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2.5 px-4 text-gray-300 rounded-lg hover:text-sky-400 transition-colors duration-200 md:p-2">
                  Create Group
                </Link>
              </li>
              <li>
                <Link 
                  href={"/join-group"} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2.5 px-4 text-gray-300 rounded-lg hover:text-sky-400 transition-colors duration-200 md:p-2">
                  Join Group
                </Link>
              </li>
              <li>
                <Link 
                  href={"/save-solo"} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2.5 px-4 text-gray-300 rounded-lg hover:text-sky-400 transition-colors duration-200 md:p-2">
                  Save Solo
                </Link>
              </li>
              <li>
                <Link 
                  href={"/savings"} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2.5 px-4 text-gray-300 rounded-lg hover:text-sky-400 transition-colors duration-200 md:p-2">
                  Savings
                </Link>
              </li>
              <li>
                <Link
                  href={"/invest"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2.5 px-4 text-gray-300 rounded-lg hover:text-sky-400 transition-colors duration-200 md:p-2">
                  Invest
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;