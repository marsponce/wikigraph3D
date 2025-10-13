import type { Metadata } from "next";
import "../styles/globals.css";

import Navbar from "@/components/layout/Navbar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
      <body>
        <main>{children}</main>
        <Header>
          <Navbar />
        </Header>
        <Footer />
      </body>
    </html>
  );
}
