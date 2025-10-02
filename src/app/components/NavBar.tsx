"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
// import { ConnectButton } from "@rainbow-me/rainbowkit"; 
// import Image from "next/image";
// import TsarosafeLogo from "../assets/TsarosafeLogo.png"; 

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

const NavBar = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const ethereum = useMemo<EthereumProvider | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const w = window as Window & { ethereum?: EthereumProvider };
    return w.ethereum;
  }, []);

  const shortAddress = useMemo(() => {
    if (!account) return "";
    return account.slice(0, 6) + "…" + account.slice(-4);
  }, [account]);

  const handleConnect = useCallback(async () => {
    if (!ethereum) {
      alert("No Ethereum provider found. Install MetaMask.");
      return;
    }
    try {
      setIsConnecting(true);
      const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
      setAccount(accounts?.[0] ?? null);
    } catch (err) {
      console.error("Wallet connection failed", err);
    } finally {
      setIsConnecting(false);
    }
  }, [ethereum]);

  useEffect(() => {
    if (!ethereum?.on) return;
    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = (args[0] as string[]) || [];
      setAccount(accounts?.[0] ?? null);
    };
    ethereum
      .request({ method: "eth_accounts" })
      .then((acc) => setAccount((acc as string[])?.[0] ?? null))
      .catch(() => {});
    ethereum.on && ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      if (ethereum?.removeListener) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, [ethereum]);
  return (
    <div>
      <nav className="bg-white border-gray-200 dark:bg-gray-900 border-b-2 ">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link 
          className="flex items-center space-x-3 rtl:space-x-reverse"
          href={"/"}>

          {/* <Image
              src={TsarosafeLogo}
              className="h-8"
              alt="Tsarosafe logo"
              width={32}
              height={32}
              priority
            /> */}
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              Tsarosafe
            </span>
          </Link>
          {/*  */}
          <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button
              onClick={handleConnect}
              type="button"
              className="rounded-full bg-blue-600 text-white px-4 py-2 mr-4 disabled:opacity-60"
              disabled={isConnecting}
            >
              {account ? `Connected: ${shortAddress}` : isConnecting ? "Connecting…" : "Connect Wallet"}
            </button>
            {/* ConnectButton will need to be re-evaluated for Next.js */}
            {/* <button
              type="button"
              className="flex text-sm  rounded text-white p-3 md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              id="user-menu-button"
              aria-expanded="false"
              data-dropdown-toggle="user-dropdown"
              data-dropdown-placement="bottom"
            >
             <ConnectButton />
            </button> */}
            {/* Dropdown menu */}
            <div
              className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600"
              id="user-dropdown"
            >
              <div className="px-4 py-3">
                <span className="block text-sm text-gray-900 dark:text-white">
                  Bonnie Green
                </span>
              
              </div>
              <ul className="py-2" aria-labelledby="user-menu-button">
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Settings
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Earnings
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Sign out
                  </a>
                </li>
              </ul>
            </div>
            <button
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-user"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
          
          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-user"
          >
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
         
                <Link href={"/dashboard"} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white dark:border-gray-700">
                   Dashboard
                </Link>
         
              
                <Link href={'/create-group'} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white dark:border-gray-700">
                  Create New Group
              
                </Link>
                 <Link href={"/join-group"} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white dark:border-gray-700">
                     Join Group
                </Link>
                <Link href={"/savings"} className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white dark:border-gray-700">
                     
                     Savings
                </Link>
              
              
              <li>
                <Link
                  href={"/invest"}
                  className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white dark:border-gray-700"
                >
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
