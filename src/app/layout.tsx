import "../styles/globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Phy0n",
  description: "Idk but this is Phy0n portofolio",
  icons: {
    icon: [
      { url: '/image/iconsementara.jpg', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/image/iconsementara.jpg', type: 'image/jpeg', sizes: '180x180' },
    ],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
