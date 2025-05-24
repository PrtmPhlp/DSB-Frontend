import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/className";
import { ThemeProvider } from "@/components/theme-provider";
import AnimateEnter from "@/components/AnimateEnter";

const inter = Inter({
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vertretungsplan",
  description: "Vertretungsplan Frontend für PyDSB",
  keywords: ["Vertretungsplan", "Schule", "Unterricht", "Stundenplan"],
  authors: [{ name: "PrtmPhlp", url: "https://pertermann.de" }],
  openGraph: {
    description: "Tinkerer.",
    images: [
      {
        alt: "Pertermann",
        height: 1080,
        url: "https://pertermann.de/static/images/og.png",
        width: 1920,
      },
    ],
    locale: "de_DE",
    siteName: "Pertermann.de",
    title: "Pertermann.de",
    type: "website",
    url: "https://pertermann.de",
  },
  publisher: "Pertermann",
  twitter: {
    card: "summary_large_image",
    site: "@prtmphlp",
    title: "Pertermann",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          `${inter.className} ${geistSans.variable} ${geistMono.variable} antialiased`,
          "min-h-screen w-full",
          "py-4 dark:bg-neutral-900 sm:py-8",
          "motion-reduce:transform-none motion-reduce:transition-none",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnimateEnter>{children}</AnimateEnter>
        </ThemeProvider>
      </body>
    </html>
  );
}