import Link from "next/link";

const Footer = () => {
  // FOOTER - Simple, Sharp, Slick
  return (
      <footer className="w-full bg-[#0a192f] border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-xl font-black text-white tracking-tighter">
            TSAROSAFE<span className="text-blue-500">.</span>
          </span>
          <div className="flex gap-8 text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest">
             <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
             <Link href="#" className="hover:text-white transition-colors">Discord</Link>
             <Link href="#" className="hover:text-white transition-colors">Github</Link>
             <Link href="#" className="hover:text-white transition-colors text-blue-500">Terms of Service</Link>
          </div>
          <span className="text-[10px] font-mono text-gray-600 uppercase">© 2025 ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
  );
};

export default Footer;




