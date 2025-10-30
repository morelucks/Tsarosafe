import Image from "next/image"
import FirstIcon from "../assets/ph_arrows-split-light.png"
import SecondIcon from "../assets/iconamoon_shield-light.png"
import ThridIcon from "../assets/ph_arrows-split-light.png"
import DecentralizeImage from "../assets/Future-is-Decentralized.jpg"
const benefits = [
  {
    icon: "🛡️",
    title: "Secure by Design",
    desc: "Every saving is protected with top-tier crypto and privacy tech.",
  },
  {
    icon: "🤝",
    title: "Effortless for Groups",
    desc: "Easily create or join a group plan—manage together, win together.",
  },
  {
    icon: "💰",
    title: "Real Returns, No Surprises",
    desc: "Track your growth and enjoy high yield—no hidden fees, ever.",
  },
  {
    icon: "🔍",
    title: "Absolute Transparency",
    desc: "See everything. Your dashboard has nothing to hide: all data, real-time.",
  },
];

const WhyUs = () => (
  <section className="py-16 w-full fade-in" style={{animationDelay: '0.4s'}}>
    <div className="max-w-4xl mx-auto text-center mb-12">
      <h2 className="font-extrabold text-3xl md:text-5xl mb-4 text-white drop-shadow">Why Choose Tsarosafe?</h2>
      <p className="text-lg md:text-xl text-white opacity-85 font-light">Peace of mind, more earnings, less hassle. Every kind of saver wins here.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-2 md:px-8">
      {benefits.map((b,i) => (
        <div
          key={i}
          className={`rounded-2xl p-7 flex flex-col items-center shadow-xl border border-gray-200 bg-white fade-up`}
          style={{animationDelay: `${0.2 + i * 0.1}s`}}
        >
          <div className="text-4xl md:text-5xl mb-4">{b.icon}</div>
          <div className="text-lg md:text-xl font-bold mb-2 text-center text-gray-900">{b.title}</div>
          <p className="text-md text-center opacity-85 font-normal text-gray-600">{b.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default WhyUs;
