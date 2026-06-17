// Home: landing page with hero section, WhyUs, and HowItWorks
"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import futuristicVault from "./assets/futuristic_web3_vault.png";
import WhyUs from "./components/WhyUs";
import HowItWorks from "./components/HowItWorks";

const Hero = () => {
  const { open } = useAppKit();
  const { isConnected } = useAccount();

  return (
    <section className="relative w-full min-h-screen flex items-center bg-slate-50 dark:bg-[#030014] overflow-hidden pt-24 pb-16 transition-colors duration-300">
      {/* Background Decorative Mesh Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }}></div>

      {/* Grid Overlay with Radial Gradient Mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 dark:opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Text / CTAs */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-500 dark:text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-8 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Decentralized Savings Protocol
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 dark:text-white leading-[0.95] tracking-tight mb-8">
              SAVE <br />
              <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                SMARTER.
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-lg mb-10 leading-relaxed font-medium">
              A refined approach to digital wealth. Secure solo vaults or collaborative group savings—built on chain for absolute transparency and high yields.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              {isConnected ? (
                <Link
                  href="/savings"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-10 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-center text-sm md:text-base uppercase tracking-wider"
                >
                  Launch Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => open()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-10 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-center text-sm md:text-base uppercase tracking-wider"
                >
                  Connect Wallet
                </button>
              )}
              <a
                href="#howitworks"
                className="border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 font-bold py-4 px-10 rounded-full transition-all text-center text-sm md:text-base uppercase tracking-wider hover:scale-105 active:scale-95"
              >
                Learn More
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/5 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">$14.2M+</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Secured</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">46+</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Audits Done</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">0%</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Platform Fees</p>
              </div>
            </div>
          </div>

          {/* Right Mockup Representation */}
          <div className="flex-1 relative w-full flex justify-center lg:justify-end">
            <div className="relative group max-w-lg lg:max-w-xl w-full">
              {/* Card Outer Neon Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-2xl blur opacity-20 dark:opacity-30 group-hover:opacity-35 dark:group-hover:opacity-45 transition duration-1000 group-hover:duration-200"></div>
              
              {/* Glass Card Container */}
              <div className="relative bg-white/90 dark:bg-[#0b0c16]/90 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl backdrop-blur-xl p-3">
                {/* Simulated Window Header */}
                <div className="flex items-center justify-between px-3 pb-3 border-b border-slate-200 dark:border-white/5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">tsarosafe_vault_v1.0.bin</div>
                  <div className="w-6"></div>
                </div>

                {/* 3D Generated Image Asset */}
                <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 bg-slate-100 dark:bg-slate-950">
                  <Image
                    src={futuristicVault}
                    alt="Tsarosafe Vault Illustration"
                    width={600}
                    height={600}
                    className="w-full h-auto object-cover transform hover:scale-102 transition duration-700 ease-in-out"
                    priority
                  />
                </div>

                {/* Floating Widgets */}
                <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3.5 px-6 rounded-xl shadow-xl border border-cyan-400/20 backdrop-blur-md hidden md:block">
                  <p className="text-3xl font-extrabold tracking-tight leading-none mb-1">100%</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-cyan-200">On-Chain Security</p>
                </div>

                <div className="absolute -top-6 -right-6 bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-white py-3 px-5 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 backdrop-blur-md hidden md:block">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-xs font-mono font-bold tracking-wider">Stacks & Celo Live</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FinalCTA = () => {
  return (
    <section className="relative bg-slate-100 dark:bg-[#02000a] py-32 overflow-hidden border-t border-slate-200 dark:border-white/5 transition-colors duration-300">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/[0.03] dark:bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Animated Ticker Background */}
      <div className="absolute top-0 left-0 w-full overflow-hidden opacity-[0.03] dark:opacity-[0.02] pointer-events-none select-none">
        <div className="whitespace-nowrap animate-marquee flex gap-20">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-[12rem] font-black leading-none text-slate-900 dark:text-white uppercase tracking-tighter">
              SAVE SMARTER • SAVE TOGETHER • SAVE NOW •
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-bold tracking-widest uppercase mb-8">
          🔐 VERIFIABLE CRYPTOGRAPHIC INFRASTRUCTURE
        </div>

        <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 uppercase leading-[0.95]">
          Start saving <br />
          <span className="bg-gradient-to-r from-cyan-500 to-indigo-500 bg-clip-text text-transparent font-black italic">
            like it's 2026.
          </span>
        </h2>

        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-12 font-medium leading-relaxed">
          The most secure, transparent, and rewarding protocol for individuals and groups. No fees. No gatekeepers.
        </p>

        <Link
          href="/savings"
          className="group relative inline-flex items-center justify-center p-0.5 overflow-hidden text-lg font-bold text-white rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
        >
          <span className="relative px-16 py-6 bg-slate-800 dark:bg-[#030014] text-white rounded-full group-hover:bg-opacity-0 transition-all ease-in duration-75 uppercase tracking-wider">
            Get Started Now
          </span>
        </Link>

        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-8 opacity-60">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
              SMART CONTRACTS AUDITED
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
              EST. $20M+ SECURED
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  );
};

const LandingPage = () => {
  return (
    <main className="w-full overflow-x-hidden bg-slate-50 dark:bg-[#030014] text-slate-800 dark:text-white selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-300">
      <Hero />

      {/* TRUST BAR - Horizontal scrolling marquee */}
      <div className="w-full bg-slate-100 dark:bg-[#05031b] border-y border-slate-200 dark:border-white/5 py-10 overflow-hidden transition-colors duration-300">
        <div className="flex whitespace-nowrap gap-12 animate-marquee-fast px-6 opacity-45 dark:opacity-25 grayscale contrast-200">
          {["TRUSTPILOT ★★★★★", "CELO", "STACKS", "METAMASK", "UNISWAP", "AAVE", "CHAINLINK", "COINBASE"].map((partner) => (
            <span key={partner} className="font-extrabold text-2xl tracking-tighter italic inline-block mx-12 uppercase text-slate-500 dark:text-slate-400">
              {partner}
            </span>
          ))}
          {/* Repeat for seamless loop */}
          {["TRUSTPILOT ★★★★★", "CELO", "STACKS", "METAMASK", "UNISWAP", "AAVE", "CHAINLINK", "COINBASE"].map((partner, i) => (
            <span key={`${partner}-${i}`} className="font-extrabold text-2xl tracking-tighter italic inline-block mx-12 uppercase text-slate-500 dark:text-slate-400">
              {partner}
            </span>
          ))}
        </div>
      </div>

      <HowItWorks />

      <WhyUs />

      <FinalCTA />

      <style jsx>{`
        @keyframes marquee-fast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-fast {
          animation: marquee-fast 25s linear infinite;
        }
      `}</style>
      
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white w-12 h-12 rounded-full shadow-lg hover:from-cyan-400 hover:to-indigo-400 transition-all z-50 flex items-center justify-center text-lg hover:scale-110 active:scale-90 border border-white/10"
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </main>
  );
};

export default LandingPage;
