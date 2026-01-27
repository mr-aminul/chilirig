import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChiliRig - Blazing Flavor, Bottled For You",
  description: "Premium chili oil crafted with real ingredients. Heat with depth. Flavor with bite.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <PageTransitionLoader />
        {children}
      </body>
    </html>
  );
}

