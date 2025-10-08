import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wikigraph",
  description: "A 3D graph of Wikipedia articles connected by their hyperlinks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen min-w-screen">
        <div className="root headlessui-portal-root">
          {/* Main content */}
          <main className="w-full">{children}</main>
          {/* Header fixed at the top */}
          <Header className="fixed top-0 left-0 w-full">
            <Navbar />
          </Header>
          {/* Footer fixed at the bottom */}
          <Footer className="fixed bottom-0 left-0 w-full h-8" />
        </div>
      </body>
    </html>
  );
}
