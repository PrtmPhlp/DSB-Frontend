import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
// import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/className";

import { Inter } from "next/font/google";
import AnimateEnter from '@/components/ui/AnimateEnter';

const inter = Inter({ subsets: ["latin"] });

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata: Metadata = {
  title: "Vertretungsplan",
  description: "Vertretungsplan Frontend für PyDSB",
  keywords: ["Vertretungsplan", "Schule", "Unterricht", "Stundenplan"],
  authors: [{ name: "PrtmPhlp", url: "https://pertermann.de" }],
  openGraph: {
    description: 'Tinkerer.',
    images: [
      {
        alt: 'Pertermann',
        height: 1080,
        url: 'https://pertermann.de/static/images/og.png',
        width: 1920,
      },
    ],
    locale: 'de_DE',
    siteName: 'Pertermann.de',
    title: 'Pertermann.de',
    type: 'website',
    url: 'https://pertermann.de',
  },
  publisher: 'Pertermann',
  twitter: {
    card: 'summary_large_image',
    site: '@prtmphlp',
    title: 'Pertermann',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={cn(
        `${inter.className}`,
        "min-h-screen w-full",
        "py-4 dark:bg-neutral-900 sm:py-8",
        "motion-reduce:transform-none motion-reduce:transition-none",
      )}>
        <AnimateEnter>
          <>
            {children}
          </>
        </AnimateEnter>

        {/* <Toaster /> */}
      </body>
    </html>
  );
}
