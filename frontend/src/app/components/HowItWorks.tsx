// HowItWorks: landing page section explaining the platform steps
const steps = [
  {
    number: "01",
    icon: "🪪",
    title: "Connect Wallet",
    desc: "Seamlessly link your Web3 wallet to begin your secure decentralized financial journey.",
  },
  {
    number: "02",
    icon: "👥",
    title: "Choose Your Path",
    desc: "Set up a private vault for solo growth or launch a collective goal with friends.",
  },
  {
    number: "03",
    icon: "💸",
    title: "Automate & Earn",
    desc: "Deposit funds and let smart contracts handle the rest. Secure, transparent, and rewarding.",
  },
];

const HowItWorks = () => (
  <section className="py-32 w-full bg-[#05031b] overflow-hidden relative border-t border-white/5" id="howitworks">
    {/* Decorative blur circle */}
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none"></div>

    <div className="max-w-6xl mx-auto px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
        <div className="max-w-xl">
          <div className="text-[10px] font-mono text-cyan-400 font-bold tracking-[0.25em] uppercase mb-4">
            // GETTING STARTED
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
            Built for the <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-black">modern saver.</span>
          </h2>
        </div>
        <p className="text-slate-400 text-base max-w-sm leading-relaxed">
          A streamlined three-step process designed to get your capital working for you immediately.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <div
            key={i}
            className="group relative p-10 bg-[#0a0824]/40 hover:bg-[#0f0c35]/30 border border-white/5 hover:border-cyan-500/20 rounded-3xl transition-all duration-300 shadow-2xl"
          >
            {/* Step Number & Icon */}
            <div className="flex justify-between items-start mb-10">
              <span className="text-6xl font-black text-slate-800/80 group-hover:text-cyan-500/10 transition-colors duration-300 leading-none select-none font-mono">
                {step.number}
              </span>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 text-3xl grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-300">
                {step.icon}
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-cyan-400 transition-colors">
                {step.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>

            {/* Minimalist Arrow for desktop */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-slate-700 animate-pulse"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
