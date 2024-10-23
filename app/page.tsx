// import { Button } from "../components/ui/button";
import React from 'react';
// import dynamic from 'next/dynamic';

// const NewTable = dynamic(() => import('../components/newtable'), { ssr: false });

import { cn } from "@/lib/className";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "../components/ui/pagination";

import SubstitutionTable from '../components/SubstitutionTable';

export default function Home() {
  // const sampleData = {
  //   // Your sample data here
  // };

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
        <div>
          <div className="py-6 md:py-12 dark:border-gray-800 flex justify-center">
            <div>
              <h1 className="text-3xl sm:text-4xl tracking-tighter md:text-5xl font-bold text-black text-center dark:text-white">
                Vertretungsplan
              </h1>
              <p className="text-gray-500 text-lg text-center mt-2 md:text-xl/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Vertretungsplan für <b className="dark:text-gray-300">MSS12</b>.
              </p>
            </div>
          </div>
          {/* <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="https://google.de" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="https://apple.de">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="https://example.org" />
              </PaginationItem>
            </PaginationContent>
          </Pagination> */}

          {/* <Component start /> */}
          {/* <Table /> */}
          {/* <Component end /> */}
          {/* <NewTable /> */}
          <SubstitutionTable />
        </div>
      </body>
    </html>
  );
}
