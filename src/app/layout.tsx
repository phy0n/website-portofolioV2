import { Suspense } from 'react';
import "../styles/globals.css";
import { Geist, Geist_Mono, Nunito, Manrope } from "next/font/google";
import type { Metadata } from "next";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import GlobalGsap from "@/components/shared/GlobalGsap";
import VercelAnalytics from "@/components/analytics/VercelAnalytics";
import { ThemeProvider } from "@/components/shared/ThemeProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  weight: ['300', '400', '600', '700', '800'],
  variable: "--font-nunito",
  subsets: ["latin"],
});

const manrope = Manrope({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Phy0n",
    template: "Phy0n %s",
  },
  description: "Welcome to phy0n.site",
  metadataBase: new URL("https://phy0n.site"),
  icons: {
    icon: [
      { url: '/image/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/image/logo.png', type: 'image/png', sizes: '180x180' },
    ],
  },
  openGraph: {
    title: 'Phy0n',
    description: 'Welcome to phy0n.site',
    type: 'website',
    url: 'https://phy0n.site/',
    images: [
      {
        url: '/image/banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Phy0n',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phy0n',
    description: 'Welcome to phy0n.site',
    images: ['/image/banner.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

import GlobalTransition from "@/components/shared/GlobalTransition";

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} ${manrope.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <GlobalGsap>{children}</GlobalGsap>
          <Suspense fallback={null}>
            <GlobalTransition />
          </Suspense>
          <AnalyticsTracker />
          <VercelAnalytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
