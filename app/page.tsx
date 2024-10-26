import React from 'react';

import { cn } from "@/lib/className";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

import SubstitutionTable from '../components/SubstitutionTable';

export default function Home() {
  return (
    <html lang="en de">
      <head>
        <title>Vertretungplan</title>
      </head>
      <body
        className={cn(
          `${inter.className}`,
          "h-full, min-h-screen, relative w-full",
          "my-4 bg-white dark:bg-gray-900 sm:my-24",
          "motion-reduce:transform-none motion-reduce:transition-none",
        )}
      >
        <SubstitutionTable />
      </body>
    </html>
  );
}
