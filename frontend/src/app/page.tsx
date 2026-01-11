"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import bgImage from "./assets/Tsarosafe.png";
import bgImage2 from "./assets/image 7.png";
import Pointer from "./assets/Group.png";
import WhyUs from "./components/WhyUs";
import HowItWorks from "./components/HowItWorks";



const Hero = () => {
  const { open } = useAppKit();
  const { isConnected } = useAccount();

  return (
    <section className="relative w-full min-h-[90vh] flex items-center bg-[#0a192f] overflow-hidden pt-20">
      {/* Subtle Technical Grid - No Gradient */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `linear-gradient(#233554 1px, transparent 1px), linear-gradient(90deg, #233554 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-block py-1 px-3 border border-blue-400 text-blue-400 text-xs font-bold tracking-[0.2em] uppercase mb-6">
              Web3 Savings Protocol
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8">
              SAVE <br />
              <span className="text-blue-500">SMARTER.</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-lg mb-10 leading-relaxed font-medium">
              A refined approach to digital wealth. Secure solo vaults or
              collaborative group savings—built on chain for absolute
              transparency.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {isConnected ? (
                <Link
                  href="/savings"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 px-10 rounded-none transition-all text-center"
                >
                  LAUNCH APP
                </Link>
              ) : (
                <button
                  onClick={() => open()}
                  className="bg-white hover:bg-gray-200 text-[#0a192f] font-bold py-5 px-10 rounded-none transition-all"
                >
                  CONNECT WALLET
                </button>
              )}
              <a
                href="#howitworks"
                className="border border-white/20 text-white hover:bg-white/10 font-bold py-5 px-10 rounded-none transition-all text-center"
              >
                LEARN MORE
              </a>
            </div>
          </div>

          {/* Right Side: Flat Frame Illustration */}
          <div className="flex-1 relative w-full flex justify-center lg:justify-end">
            <div className="relative border-[1px] border-white/10 p-4 bg-[#112240]">
              <div className="border-[1px] border-white/20">
                <Image
                  src={bgImage2}
                  alt="Interface"
                  width={500}
                  height={400}
                  className="grayscale hover:grayscale-0 transition-all duration-700"
                  priority
                />
              </div>
              {/* Floating Accent (Solid, No shadow) */}
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 hidden md:block">
                <p className="text-2xl font-black">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  On-Chain Security
                </p>
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
    <section className="relative bg-white py-32 overflow-hidden">
      {/* Animated Ticker Background - Fast, Modern, No Shadow */}
      <div className="absolute top-0 left-0 w-full overflow-hidden opacity-[0.03] pointer-events-none select-none">
        <div className="whitespace-nowrap animate-marquee flex gap-20">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-[15rem] font-black leading-none">
              SAVE SMARTER SAVE TOGETHER SAVE NOW
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-6xl md:text-[100px] font-black text-black tracking-tighter mb-12 uppercase leading-[0.85]">
          Start saving <br />
          <span className="bg-black text-white px-4 italic">
            like it's 2025.
          </span>
        </h2>

        <p className="text-xl text-gray-500 max-w-xl mx-auto mb-14 font-medium leading-relaxed">
          The most secure, transparent, and rewarding protocol for individuals
          and groups. No fees. No gatekeepers.
        </p>

        <Link
          href="/savings"
          className="group relative inline-flex items-center justify-center"
        >
          {/* Solid Offset Box for "Mechanical" Feel (Replaces Shadow) */}
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-blue-600 transition-transform group-hover:translate-x-0 group-hover:translate-y-0"></div>

          <div className="relative bg-black text-white px-16 py-8 text-2xl font-black uppercase tracking-widest border-2 border-black transition-all group-active:translate-x-1 group-active:translate-y-1">
            Get Started Now
          </div>
        </Link>

        <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-mono font-bold">
              SMART CONTRACTS AUDITED
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-mono font-bold">
              EST. $20M+ SECURED
            </span>
          </div>
        </div>
      </div>

      {/* CSS Animation for the background ticker */}
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
const FakeFeaturedBar = () => (
  <section
    className="w-full bg-white py-8 px-2 gap-4 md:gap-12 fade-in border-t border-b border-gray-100"
    style={{ animationDelay: "0.4s" }}
  >
    <div className="max-w-6xl mx-auto flex items-center justify-center ">
      <span className="opacity-60 font-semibold text-xs md:text-base tracking-widest">
        As seen in:
      </span>
      <div className="inline-flex gap-8 items-center ml-8">
        <span className="bg-gray-100 rounded-xl px-4 py-1 text-gray-600 font-bold text-sm">
          Trustpilot ★★★★★
        </span>
        <span className="bg-gray-100 rounded-xl px-4 py-1 text-gray-600 font-bold text-sm">
          CoinTelegraph
        </span>
        <span className="bg-gray-100 rounded-xl px-4 py-1 text-gray-600 font-bold text-sm">
          BlockWorks
        </span>
        <span className="bg-gray-100 rounded-xl px-4 py-1 text-gray-600 font-bold text-sm hidden md:inline">
          FinTechDaily
        </span>
      </div>
    </div>
  </section>
);

const DownFunnelCTA = () => (
  <section className="w-full py-16 bg-gradient-to-r from-blue-50 via-white to-blue-100 border-t border-b border-blue-200 fade-in">
    <div className="max-w-3xl mx-auto flex flex-col items-center px-6 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900">
        Take control of your financial future today.
      </h2>
      <p className="text-lg md:text-xl mb-8 text-blue-700">
        Join Tsarosafe and start your journey to smarter, safer savings—solo or
        as a team.
      </p>
      <a
        href="/savings"
        className="bg-blue-900 text-white font-bold py-3 px-7 rounded-full text-lg shadow-lg hover:bg-blue-800 transition-all transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95"
      >
        Get Started Now
      </a>
    </div>
  </section>
);


const LandingPage = () => {
  return (
    <main className="w-full bg-white selection:bg-blue-600 selection:text-white">
      <Hero />

      {/* TRUST BAR - Horizontal scrolling marquee for movement */}
      <div className="w-full bg-white border-y border-black/[0.08] py-8 overflow-hidden">
        <div className="flex whitespace-nowrap gap-12 animate-marquee-fast px-6 opacity-30 grayscale contrast-200">
          {["TRUSTPILOT ★★★★★", "COINBASE", "METAMASK", "BINANCE", "UNISWAP", "AAVE", "CHAINLINK"].map((partner, i) => (
            <span key={partner} className="font-black text-xl tracking-tighter italic inline-block mx-8 uppercase">
              {partner}
            </span>
          ))}
          {/* Repeat for seamless loop */}
          {["TRUSTPILOT ★★★★★", "COINBASE", "METAMASK", "BINANCE", "UNISWAP", "AAVE", "CHAINLINK"].map((partner, i) => (
            <span key={i} className="font-black text-xl tracking-tighter italic inline-block mx-8 uppercase">
              {partner}
            </span>
          ))}
        </div>
      </div>

      <HowItWorks />

      <section className="w-full bg-[#0a192f] py-24">
        <div className="max-w-7xl mx-auto">
          <WhyUs />
        </div>
      </section>

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
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 opacity-80 hover:opacity-100"
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </main>

  );
};

export default LandingPage;


