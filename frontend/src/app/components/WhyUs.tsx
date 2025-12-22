import Image from "next/image";

const benefits = [
  {
    icon: "🛡️",
    title: "Secure by Design",
    desc: "Every saving is protected with top-tier smart contract audits and privacy tech.",
  },
  {
    icon: "🤝",
    title: "Group Dynamics",
    desc: "Seamless collective saving pools—manage together, grow together with multi-sig security.",
  },
  {
    icon: "💰",
    title: "Zero Hidden Fees",
    desc: "Track your growth with absolute precision. High yield without the banking bureaucracy.",
  },
  {
    icon: "🔍",
    title: "On-Chain Verifiable",
    desc: "Total transparency. Your dashboard reflects real-time blockchain data, never obscured.",
  },
];

const WhyUs = () => (
  <section className="py-24 w-full bg-[#0a192f] border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6">
      {/* Header: Left Aligned for a more "Mad" Modern look */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
        <div className="max-w-2xl">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
            WHY <br />
            TSAROSAFE?
          </h2>
        </div>
        <p className="text-gray-400 text-lg md:text-xl max-w-sm font-medium leading-relaxed">
          We’ve stripped away the complexity of traditional finance to give you
          a pure, secure savings experience.
        </p>
      </div>

      {/* Benefits Grid: Clean Borders, No Shadows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-white/10">
        {benefits.map((b, i) => (
          <div
            key={i}
            className="group p-10 border-b md:border-b-0 border-white/10 hover:bg-white/[0.02] transition-colors duration-300 relative overflow-hidden"
            // Adding a thin right border for desktop
            style={{
              borderRight:
                i < benefits.length - 1
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "none",
            }}
          >
            {/* Step Marker */}
            <div className="text-[10px] font-mono text-blue-500 mb-8 font-bold opacity-50">
              0{i + 1} //
            </div>

            {/* Icon - Grayscale to Color on Hover */}
            <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:-translate-y-1">
              {b.icon}
            </div>

            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">
              {b.title}
            </h3>

            <p className="text-gray-400 text-base leading-relaxed font-medium">
              {b.desc}
            </p>

            {/* Subtle bottom accent line that appears on hover */}
            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 group-hover:w-full transition-all duration-500" />
          </div>
        ))}
      </div>

      {/* Optional: Bottom visual element for that "Mad" creative touch */}
      <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-gray-600 tracking-[0.2em] uppercase">
        <span>Protocol v1.0.4</span>
        <span>Secure On-Chain Infrastructure</span>
        <span>Est. 2025</span>
      </div>
    </div>
  </section>
);

export default WhyUs;
