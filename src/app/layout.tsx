import type { Metadata } from "next";
import "../styles/globals.css";

import { Navbar, Header, Footer } from "@/components/layout";

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
        <Header>
          <Navbar />
        </Header>
        <main className="headless-ui-portal-root">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
