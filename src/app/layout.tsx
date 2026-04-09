import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { DemoProvider } from "@/lib/demo-context";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DentalVision Pro — AI Smile Design Studio",
  description: "AI-powered smile design platform for Ora Dentistry Spa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-brand-cream text-brand-warm-gray">
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
