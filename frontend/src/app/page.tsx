// import Image from "next/image";
// import bgImage from "./assets/Tsarosafe.png";
// import bgImage2 from "./assets/image 7.png";
// import Pointer from "./assets/Group.png";
// import WhyUs from "./components/WhyUs";
// import HowItWorks from "./components/HowItWorks";


// const Hero = () => (
//   <section className="relative w-full flex flex-col md:flex-row items-center gap-8 py-16 bg-gradient-to-tr from-[#0f2a56] via-blue-900 to-[#2086e9] min-h-[75vh] shadow-2xl fade-in" style={{ animationDelay: '0.1s' }}>
//     <div className="w-full max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8 items-center justify-between">
//       {/* Left: Headline and CTA */}
//       <div className="flex-1 z-10 flex flex-col justify-center items-start text-white max-w-[520px] md:py-10">
//         <h1 className="font-extrabold text-4xl md:text-6xl leading-tight mb-6 drop-shadow-xl">Save Smarter,<br className="hidden md:inline"/> Together or Individually.</h1>
//         <p className="text-lg md:text-xl font-light mb-8 opacity-90">Empower your financial journey with flexible, secure, and rewarding savings plans—whether you’re growing wealth solo or with a trusted group.</p>
//         <div className="flex gap-5 mb-10">
//           <a href="/savings" className="bg-[#fff] text-blue-900 font-semibold py-3 px-7 rounded-full text-lg shadow hover:bg-blue-50 border border-white transition-all">Start Saving</a>
//           <a href="#howitworks" className="bg-blue-900/80 text-white font-semibold py-3 px-7 rounded-full text-lg border-2 border-[#fff] hover:bg-[#fff] hover:text-blue-900 transition-all">Learn More</a>
//         </div>
//         <div className="flex items-center mt-6 gap-4 opacity-80">
//           <Image src={Pointer} alt="Go Down" width={24} height={24} />
//           <span className="text-base font-medium">Group or Solo. Total Control.</span>
//         </div>
//       </div>
//       {/* Right: Illustration/background */}
//       <div className="flex-1 relative flex justify-center items-center md:justify-end">
//         <div className="z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white/70 backdrop-blur-xl">
//           <Image src={bgImage2} alt="Savings Illustration" width={440} height={380} className="object-contain md:w-[400px] w-[320px] h-auto" priority />
//         </div>
//         <div className="absolute top-10 left-1/3 w-[220px] h-[120px] md:w-[320px] md:h-[180px] -z-10 opacity-50">
//           <Image src={bgImage} alt="Brand Pattern" width={320} height={180} className="w-full h-full object-cover blur-[2px]" priority />
//         </div>
//       </div>
//     </div>
//     <div className="absolute inset-0 bg-gradient-to-br from-[#0f2a5680] to-[#2086e980] pointer-events-none z-0" />
//   </section>
// );

// const FakeFeaturedBar = () => (
//   <section className="w-full bg-white py-8 px-2 gap-4 md:gap-12 fade-in border-t border-b border-gray-100" style={{ animationDelay: '0.4s' }}>
//     <div className="max-w-6xl mx-auto flex items-center justify-center ">
//       <span className="opacity-60 font-semibold text-xs md:text-base tracking-widest">As seen in:</span>
//       <div className="inline-flex gap-8 items-center ml-8">
//         <span className="bg-gray-100 rounded-xl px-4 py-1 text-gray-600 font-bold text-sm">Trustpilot ★★★★★</span>
//         <span className="bg-gray-100 rounded-xl px-4 py-1 text-gray-600 font-bold text-sm">CoinTelegraph</span>
//         <span className="bg-gray-100 rounded-xl px-4 py-1 text-gray-600 font-bold text-sm">BlockWorks</span>
//         <span className="bg-gray-100 rounded-xl px-4 py-1 text-gray-600 font-bold text-sm hidden md:inline">FinTechDaily</span>
//       </div>
//     </div>
//   </section>
// );

// const DownFunnelCTA = () => (
//   <section className="w-full py-16 bg-gradient-to-r from-blue-50 via-white to-blue-100 border-t border-b border-blue-200 fade-in">
//     <div className="max-w-3xl mx-auto flex flex-col items-center px-6 text-center">
//       <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900">Take control of your financial future today.</h2>
//       <p className="text-lg md:text-xl mb-8 text-blue-700">Join Tsarosafe and start your journey to smarter, safer savings—solo or as a team.</p>
//       <a href="/savings" className="bg-blue-900 text-white font-bold py-3 px-7 rounded-full text-lg shadow-lg hover:bg-blue-800 transition-all transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95">Get Started Now</a>
//     </div>
//   </section>
// );

// const LandingPage = () => {
//   return (
//     <main className="w-full">
//       {/* HERO */}
//       <Hero />

//       {/* How it works */}
//       <section className="w-full rounded-t-3xl" id="howitworks">
//         <div className="rounded-t-3xl mx-auto">
//           <HowItWorks />
//         </div>
//       </section>

//       {/* Why Choose Us */}
//       <section className="w-full bg-gradient-to-tr from-[#0f2a56] via-blue-900 to-[#2086e9]">
//         <div className="max-w-6xl mx-auto">
//           <WhyUs />
//         </div>
//       </section>

//       {/* Featured bar / trust logos */}
//       {/* <FakeFeaturedBar /> */}

//       {/* Down-funnel CTA */}
//       <DownFunnelCTA />
//     </main>
//   );
// };

// export default LandingPage;


import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { FarcasterProvider } from "./components/farcaster-provider";
import { AppKitProvider } from "./components/AppKitProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tsarosafe - Save Smarter Together",
  description: "Empower your financial journey with flexible, secure, and rewarding savings plans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased mx-auto`}
      >
        <AppKitProvider>
          <FarcasterProvider>
            <NavBar />
            {children}
            <Footer />
          </FarcasterProvider>
        </AppKitProvider>
      </body>
    </html>
  );
}