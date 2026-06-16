import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { FarcasterProvider } from "./components/farcaster-provider"
import { AppKitProvider } from "./components/AppKitProvider"
import { NotificationProvider } from "@/context/NotificationContext";
import { StacksWalletProvider } from "@/context/StacksWalletContext";
import { MiniPayProvider } from "@/context/MiniPayContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tsarosafe | Decentralized Savings, Lending & Payroll",
  description: "Secure, transparent community savings and corporate crypto payroll.",
  other: {
    "talentapp:project_verification": "bb63857fe8e8bad20cc93b041fdd9e2ce60d6ff07d7dbeb172e07dc7d260d0208a1a2dd4a5ec17283fa0e4c3b8a4ff506bf6b3c28b8b9603ee2f682e85feee62"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased mx-auto`}>
        <AppKitProvider>
          <FarcasterProvider>
            <NotificationProvider>
              <StacksWalletProvider>
                <NavBar />
                {children}
              </StacksWalletProvider>
            </NotificationProvider>
            <Footer />
          </FarcasterProvider>
        </AppKitProvider>
      </body>
    </html>
  );
}
