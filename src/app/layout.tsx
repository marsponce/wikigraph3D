import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
      <body className="antialiased min-h-screen flex flex-col min-w-screen">
        {/* Header fixed at the top */}
        <Header className="fixed top-0 left-0 w-full z-50">
          <Navbar />
        </Header>

        {/* Main content */}
        <main className="w-full">{children}</main>

        {/* Footer fixed at the bottom */}
        <Footer className="fixed bottom-0 left-0 w-full h-16 z-50" />
      </body>
    </html>
  );
}
