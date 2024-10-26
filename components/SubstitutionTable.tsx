"use client";

import { TextShimmer } from '@/components/TextShimmer';
import React, { useEffect, useState } from 'react';
import { Terminal } from "lucide-react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SubstitutionItem {
    content: {
        info: string;
        position: string;
        room: string;
        subject: string;
        teacher: string;
        topic: string;
    }[];
    date: string;
    id: string;
    weekDay: [string, string];
}

interface SubstitutionData {
    class: string;
    createdAt: string;
    substitution: SubstitutionItem[];
}

const SubstitutionTable: React.FC = () => {
    const [data, setData] = useState<SubstitutionData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://10.0.1.6:5555/api');
                const result = await response.json();
                setData(result);
            } catch (error) {
                setError((error as Error).message);
            }
        };

        // Hide the skeleton after 500ms
        const timer = setTimeout(() => {
            setShowSkeleton(false);
        }, 200);

        fetchData();

        return () => clearTimeout(timer);
    }, []);

    const headerContent = (
        <div className="py-6 md:py-12 dark:border-gray-800 flex justify-center">
            <div>
                <h1 className="text-3xl sm:text-4xl tracking-tighter md:text-5xl font-bold text-black text-center dark:text-white">
                    Vertretungsplan
                </h1>
                {showSkeleton ? (
                    <Skeleton className={cn("h-6 w-48 mx-auto mt-2", "dark:bg-neutral-800")} />
                ) : (
                    <div className={`text-gray-500 text-lg text-center mt-2 md:text-xl/relaxed xl:text-xl/relaxed dark:text-gray-400 ${error || data ? 'visible' : 'invisible'}`}>
                        {error ? (
                            <TextShimmer
                                duration={1.2}
                                className='text-xl font-medium [--base-color:theme(colors.red.600)] [--base-gradient-color:theme(colors.red.200)] dark:[--base-color:theme(colors.red.700)] dark:[--base-gradient-color:theme(colors.red.400)]'
                            >
                                konnte nicht geladen werden
                            </TextShimmer>
                        ) : (
                            <>
                                Vertretungsplan für <b className="dark:text-gray-300">
                                    {data?.class}
                                </b>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const CardSkeleton = () => (
        <Card className="shadow-lg dark:bg-transparent">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <Skeleton className={cn("h-8 w-2/3", "dark:bg-neutral-800")} />
                    <Skeleton className={cn("h-4 w-20", "dark:bg-neutral-800")} />
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className={cn("h-4 w-3/4", "dark:bg-neutral-800")} />
            </CardContent>
        </Card>
    );

    if (showSkeleton) return (
        <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
            {headerContent}
            <CardSkeleton />
            {/* <Alert>
                <AlertDescription>Loading...</AlertDescription>
            </Alert> */}
        </div>
    );

    if (error) return (
        <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
            {headerContent}
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        </div>
    );

    if (!data) return (
        <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
            {headerContent}
            <Alert><AlertDescription>No data available</AlertDescription></Alert>
        </div>
    );

    const handlePrevious = () => {
        setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
    };

    const handleNext = () => {
        setCurrentPage((prev) => (prev < data.substitution.length - 1 ? prev + 1 : prev));
    };

    const currentItem = data.substitution[currentPage];

    const formatDate = (dateString: string) => {
        const [day, month, year] = dateString.split('-');
        return `${day}.${month}.${year}`;
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
            {headerContent}

            {showSkeleton ? <CardSkeleton /> : (
                <Card className="shadow-lg dark:bg-transparent">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-xl sm:text-2xl font-bold dark:text-white">
                                {currentItem.weekDay[1]}, {formatDate(currentItem.date)}
                            </CardTitle>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {currentItem.content.length} Einträge
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Letzte Aktualisierung: {new Date(data.createdAt).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="overflow-x-auto">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious onClick={handlePrevious} className="select-none">
                                Zurück
                            </PaginationPrevious>
                        </PaginationItem>
                        {data.substitution.map((_, index) => {
                            const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

                            if (!isMobile || index < 4) {
                                return (
                                    <PaginationItem key={index}>
                                        <PaginationLink
                                            onClick={() => setCurrentPage(index)}
                                            isActive={currentPage === index}
                                        >
                                            {index + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            } else if (isMobile && index === 4) {
                                return (
                                    <PaginationItem key={index}>
                                        <PaginationLink>...</PaginationLink>
                                    </PaginationItem>
                                );
                            }
                            return null;
                        })}
                        <PaginationItem>
                            <PaginationNext onClick={handleNext} className="select-none">
                                Weiter
                            </PaginationNext>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>

            {currentItem.content.length === 0 ? (
                <Alert>
                    <AlertDescription>Keine Vertretungen für {data.class}</AlertDescription>
                </Alert>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent dark:border-neutral-400">
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent">Stunde</TableHead>
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent">Fach</TableHead>
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent">Lehrer</TableHead>
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent">Raum</TableHead>
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent">Art</TableHead>
                                {currentItem.content.some(item => item.info) && (
                                    <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent">Info</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentItem.content.map((item, index) => (
                                <TableRow key={index} className="hover:bg-transparent dark:border-neutral-700">
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent">{item.position}</TableCell>
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent">{item.subject}</TableCell>
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent">{item.teacher}</TableCell>
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent">{item.room}</TableCell>
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent">{item.topic}</TableCell>
                                    {item.info && (
                                        <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent">{item.info}</TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default SubstitutionTable;
