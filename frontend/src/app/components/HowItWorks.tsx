// HowItWorks: landing page section explaining the platform steps
import React from 'react';

const steps = [
  {
    number: "01",
    title: "Connect Wallet",
    desc: "Seamlessly link your Web3 wallet to begin your secure decentralized financial journey.",
    color: "from-cyan-400 to-cyan-600",
    glowColor: "rgba(6, 182, 212, 0.15)",
    icon: (
      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 00-3 3z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Choose Your Path",
    desc: "Set up a private vault for solo growth or launch a collective goal with friends.",
    color: "from-indigo-400 to-indigo-600",
    glowColor: "rgba(99, 102, 241, 0.15)",
    icon: (
      <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Automate & Earn",
    desc: "Deposit funds and let smart contracts handle the rest. Secure, transparent, and rewarding.",
    color: "from-emerald-400 to-emerald-600",
    glowColor: "rgba(16, 185, 129, 0.15)",
    icon: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

const HowItWorks = () => {
  return (
    <section className="py-32 w-full bg-[#030014] overflow-hidden relative border-t border-white/5" id="howitworks">
      {/* Background ambient glow blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-600/5 to-transparent rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold tracking-[0.2em] uppercase mb-5">
              🚀 GETTING STARTED
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none">
              Built for the <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent font-black">modern saver.</span>
            </h2>
          </div>
          <p className="text-slate-400 text-base max-w-sm leading-relaxed font-medium">
            A streamlined three-step process designed to get your digital capital working for you immediately.
          </p>
        </div>

        {/* Steps Grid Container */}
        <div className="relative">
          
          {/* Connecting Line for desktop */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-emerald-500/20 z-0 pointer-events-none">
            <div className="w-full h-full bg-[linear-gradient(to_right,transparent_0%,rgba(6,182,212,0.4)_50%,transparent_100%)] bg-[size:200%_100%] animate-shine"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, i) => (
              <div
                key={i}
                className="group relative p-10 bg-[#070519]/50 hover:bg-[#0c0a2a]/40 border border-white/5 hover:border-cyan-500/20 rounded-3xl transition-all duration-500 overflow-hidden shadow-2xl backdrop-blur-xl hover:shadow-[0_0_50px_rgba(6,182,212,0.1)] hover:-translate-y-2"
              >
                {/* Background Corner Glow matching the step color theme */}
                <div 
                  className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${step.glowColor} 0%, transparent 70%)`
                  }}
                ></div>

                {/* Big Step Number Watermark */}
                <span className="select-none pointer-events-none absolute right-8 bottom-6 text-9xl font-black font-mono leading-none text-white/[0.01] group-hover:text-white/[0.03] group-hover:scale-105 transition-all duration-500">
                  {step.number}
                </span>

                <div className="flex justify-between items-center mb-10">
                  {/* Styled Icon Container */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:scale-115 group-hover:border-cyan-500/30 transition-all duration-300 shadow-inner">
                    {step.icon}
                  </div>

                  {/* Step indicator tag */}
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/5 group-hover:text-cyan-400 group-hover:border-cyan-500/25 transition-all">
                    Step {step.number}
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-cyan-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>

                {/* Subtle bottom gradient stripe */}
                <div className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes lineShine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shine {
          background-size: 200% auto;
          animation: lineShine 8s linear infinite;
        }
      `}} />
    </section>
  );
};

export default HowItWorks;
