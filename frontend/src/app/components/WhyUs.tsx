// WhyUs: landing page section highlighting platform advantages
import Image from "next/image";

const benefits = [
  {
    icon: "🛡️",
    title: "Secure by Design",
    desc: "Every deposit is protected with top-tier smart contract audits and cryptographic security.",
  },
  {
    icon: "🤝",
    title: "Group Dynamics",
    desc: "Seamless collective saving pools—manage together, grow together with multi-sig security controls.",
  },
  {
    icon: "💰",
    title: "Zero Hidden Fees",
    desc: "Track your growth with absolute precision. High yield without the banking bureaucracy.",
  },
  {
    icon: "🔍",
    title: "On-Chain Verifiable",
    desc: "Total transparency. Your dashboard reflects real-time blockchain status, never obscured.",
  },
];

const WhyUs = () => (
  <section className="py-32 w-full bg-[#030014] border-t border-white/5 relative overflow-hidden">
    {/* Soft ambient glow behind WhyUs */}
    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

    <div className="max-w-7xl mx-auto px-6">
      {/* Header: Left Aligned for Modern look */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 gap-10">
        <div className="max-w-2xl">
          <div className="text-[10px] font-mono text-cyan-400 font-bold tracking-[0.25em] uppercase mb-4">
            // PLATFORM ADVANTAGES
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-none">
            WHY <br />
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent font-black">
              TSAROSAFE?
            </span>
          </h2>
        </div>
        <p className="text-slate-400 text-lg max-w-sm font-medium leading-relaxed">
          We’ve stripped away the complexity of traditional finance to deliver a pure, secure, and autonomous savings experience.
        </p>
      </div>

      {/* Benefits Grid: Clean borders, premium hover card glow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((b, i) => (
          <div
            key={i}
            className="group relative p-10 bg-[#070519]/50 hover:bg-[#0c0a2a]/40 border border-white/5 hover:border-cyan-500/20 rounded-2xl transition-all duration-500 overflow-hidden"
          >
            {/* Corner Decorative Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>

            {/* Step Marker */}
            <div className="text-[10px] font-mono text-cyan-400/50 group-hover:text-cyan-400 mb-8 font-bold transition-colors">
              0{i + 1} //
            </div>

            {/* Styled Icon Container */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/[0.03] border border-white/5 mb-8 group-hover:scale-110 group-hover:border-cyan-500/30 transition-all duration-300">
              <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-300">
                {b.icon}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">
              {b.title}
            </h3>

            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              {b.desc}
            </p>

            {/* Subtle bottom accent line that slides in on hover */}
            <div className="absolute bottom-0 left-0 w-0 h-[3px] bg-gradient-to-r from-cyan-500 to-indigo-500 group-hover:w-full transition-all duration-500" />
          </div>
        ))}
      </div>

      {/* Footer statistics metadata */}
      <div className="mt-20 pt-8 border-t border-white/5 flex flex-wrap justify-between items-center text-[10px] font-mono text-slate-500 tracking-[0.2em] uppercase gap-4">
        <span>Protocol v1.0.4</span>
        <span>Secure On-Chain Infrastructure</span>
        <span>Est. 2026</span>
      </div>
    </div>
  </section>
);

export default WhyUs;
