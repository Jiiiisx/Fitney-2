import NextTopLoader from 'nextjs-toploader';
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Fitney",
  description: "Your personal fitness companion.",
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
      </body>
    </html>
  );
}
