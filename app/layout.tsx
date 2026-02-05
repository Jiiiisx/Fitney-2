import NextTopLoader from 'nextjs-toploader';
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Fitney",
  description: "Your personal fitness companion.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} scrollbar-hide`}
      suppressHydrationWarning
    >
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
      </head>
      <body>
        <NextTopLoader
            color="#FFD54F"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #FFD54F,0 0 5px #FFD54F"
        />
        {children}
        <Toaster position="top-center" />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
