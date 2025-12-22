const steps = [
  {
    number: "01",
    icon: "🪪",
    title: "Connect Wallet",
    desc: "Seamlessly link your Web3 wallet to begin your secure financial journey.",
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
  <section className="py-24 w-full bg-white overflow-hidden" id="howitworks">
    <div className="max-w-6xl mx-auto px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2">
            Built for the modern saver.
          </h2>
        </div>
        <p className="text-gray-500 text-lg max-w-sm">
          A streamlined three-step process designed to get your capital working
          for you immediately.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div
            key={i}
            className="group relative p-8 border border-gray-100 bg-[#f9fafb] hover:bg-white hover:border-blue-600 transition-all duration-300 rounded-3xl"
          >
            {/* Step Number */}
            <div className="flex justify-between items-start mb-8">
              <span className="text-5xl font-black text-gray-400 group-hover:text-blue-200 transition-colors duration-300">
                {step.number}
              </span>
              <div className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-300">
                {step.icon}
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium opacity-80">
                {step.desc}
              </p>
            </div>

            {/* Minimalist Arrow for desktop */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-gray-300"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
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
