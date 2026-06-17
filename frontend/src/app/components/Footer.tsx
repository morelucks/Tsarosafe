"use client";
// Footer: site-wide footer with branding and links
import Link from "next/link";
import { useMiniPay } from "@/context/MiniPayContext";

const Footer = () => {
  const { isMiniPay } = useMiniPay();
  
  if (isMiniPay) return null;

  // FOOTER - Simple, Sharp, Slick
  return (
      <footer className="w-full bg-slate-100 dark:bg-[#0a192f] border-t border-slate-200 dark:border-white/10 py-12 px-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">
            TSAROSAFE<span className="text-blue-500">.</span>
          </span>
          <div className="flex gap-8 text-[10px] font-mono text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest">
             <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</Link>
             <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Discord</Link>
             <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Github</Link>
             <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors text-blue-500">Terms of Service</Link>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-gray-600 uppercase">© 2025 ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
  );
};

export default Footer;




