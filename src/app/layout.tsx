import "../styles/globals.css";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import type { Metadata } from "next";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import GlobalGsap from "@/components/shared/GlobalGsap";
import VercelAnalytics from "@/components/analytics/VercelAnalytics";

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

export const metadata: Metadata = {
  title: "Phy0n",
  description: "Idk but this is Phy0n portofolio",
  metadataBase: new URL("https://phy0n.my.id"),
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
    description: 'Idk but this is Phy0n portofolio',
    type: 'website',
    url: 'https://phy0n.my.id/',
    images: [
      {
        url: '/image/logo.png',
        width: 1200,
        height: 630,
        alt: 'Phy0n',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phy0n',
    description: 'Idk but this is Phy0n portofolio',
    images: ['/image/logo.png'],
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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased`}
      >
        <GlobalGsap>{children}</GlobalGsap>
        <AnalyticsTracker />
        <VercelAnalytics />
      </body>
    </html>
  );
}
