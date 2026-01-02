import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

// Optimized font loading with next/font - eliminates layout shift
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  style: ["normal", "italic"],
  preload: true,
});

export const metadata: Metadata = {
  title: "BrainBooster - Online Tutoring",
  description: "Premium online tutoring for Maths and English. Live classes, recordings, and expert support.",
  keywords: ["tutoring", "maths", "english", "GCSE", "A-Level", "online learning"],
  authors: [{ name: "BrainBooster Education" }],
  robots: "index, follow",
  openGraph: {
    title: "BrainBooster - Online Tutoring",
    description: "Premium online tutoring for Maths and English",
    type: "website",
  },
};

// Viewport configuration for mobile optimization
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#E6F0FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
