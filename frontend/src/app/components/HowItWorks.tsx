const steps = [
  {
    icon: "🪪",
    title: "Connect or Create Account",
    desc: "Easily sign up with wallet or email in seconds.",
  },
  {
    icon: "👥",
    title: "Solo or Group Plan",
    desc: "Start a personal saving plan or invite friends & family for group savings.",
  },
  {
    icon: "💸",
    title: "Save & Grow",
    desc: "Automate contributions and watch your money multiply, securely!",
  },
];

const HowItWorks = () => (
  <section className="py-16 w-full flex flex-col items-center px-2 fade-in bg-white" style={{ animationDelay: '0.2s' }}>
    <h2 className="font-extrabold text-3xl md:text-5xl mb-6 text-gray-900 text-center drop-shadow">How it Works</h2>
    <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto opacity-80">Start your savings journey in just three simple steps—designed for everyone, from solo savers to group planners.</p>
    <div className="flex flex-col md:flex-row gap-8 md:gap-0 justify-center items-stretch w-full max-w-5xl">
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col items-center flex-1 relative md:px-10">
          {/* Number bubble */}
          <div className="w-16 h-16 bg-white text-gray-900 flex items-center justify-center text-3xl md:text-4xl rounded-full border-4 border-gray-200 shadow mb-4 scale-105 hover:scale-110 transition-transform">{step.icon}</div>
          <div className="text-xl md:text-2xl font-bold mb-2 text-gray-900 text-center">{step.title}</div>
          <p className="text-base md:text-lg text-gray-600 font-normal text-center opacity-80 mb-2">{step.desc}</p>
          {/* Connector line, except last */}
          {i < steps.length - 1 && (
            <div className="hidden md:block absolute right-0 top-1/2 w-8 h-1 bg-gray-200"></div>
          )}
        </div>
      ))}
    </div>
  </section>
);

export default HowItWorks;
