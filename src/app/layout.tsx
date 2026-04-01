import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dukamanager.co.ke"),
  title: "DukaManager - Run Your Duka Like a Pro",
  description: "Manage sales, stock, and M-Pesa payments from one simple dashboard built for Kenyan duka shops.",
  keywords: ["duka management", "Kenya shop", "M-Pesa payments", "inventory management", "point of sale"],
  authors: [{ name: "DukaManager" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DukaManager",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "DukaManager",
    "application-name": "DukaManager",
    "msapplication-TileColor": "#C75B39",
    "msapplication-tap-highlight": "no",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#C75B39",
};

import AppProviders from "@/components/common/AppProviders";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body className={`${nunito.variable} font-body text-warm-900 bg-warm-50 antialiased`}>
        <AppProviders>{children}</AppProviders>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(function(){});
          }
          if (window.matchMedia('(display-mode: standalone)').matches) {
            document.documentElement.classList.add('is-standalone');
          }
        `}} />
      </body>
    </html>
  );
}
