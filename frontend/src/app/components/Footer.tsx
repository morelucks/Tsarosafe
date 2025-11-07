import Link from "next/link";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 py-8 text-sm text-gray-600 dark:text-gray-300">
      <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-semibold">Tsarosafe</div>
        <nav className="flex items-center gap-6">
          <Link href="/" className="hover:text-blue-700">Home</Link>
          <Link href="/dashboard" className="hover:text-blue-700">Dashboard</Link>
          <Link href="/create-group" className="hover:text-blue-700">Create Group</Link>
          <Link href="/join-group" className="hover:text-blue-700">Join Group</Link>
          <Link href="/savings" className="hover:text-blue-700">Savings</Link>
          <Link href="/invest" className="hover:text-blue-700">Invest</Link>
        </nav>
        <div className="opacity-75">© {new Date().getFullYear()} Tsarosafe</div>
      </div>
    </footer>
  );
};

export default Footer;




