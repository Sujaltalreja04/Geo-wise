import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers/providers";
import { AppShell } from "@/components/layout/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GeoWise — Geospatial Intelligence Platform",
  description:
    "GeoWise: enterprise geospatial intelligence & government operations platform for Saudi Arabian government entities.",
  keywords: [
    "GeoWise",
    "GIS",
    "geospatial",
    "Saudi Arabia",
    "government",
    "spatial analysis",
    "AI detection",
  ],
  authors: [{ name: "GeoWise Platform" }],
  icons: { icon: "/logo.svg" },
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="no" className="notranslate" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} notranslate antialiased bg-background text-foreground`}
      >
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  );
}
