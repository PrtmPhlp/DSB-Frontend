"use client";

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
// import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";

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
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    // const { theme } = useTheme();

    useEffect(() => {
        fetch('http://10.0.1.6:5555/api')
            .then(response => response.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, []);

    const headerContent = (
        <div className="py-6 md:py-12 dark:border-gray-800 flex justify-center">
            <div>
                <h1 className="text-3xl sm:text-4xl tracking-tighter md:text-5xl font-bold text-black text-center dark:text-white">
                    Vertretungsplan
                </h1>
                <p className="text-gray-500 text-lg text-center mt-2 md:text-xl/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Vertretungsplan für <b className="dark:text-gray-300">
                        {loading || error ? "..." : (data ? data.class : "unbekannt")}
                    </b>
                </p>
            </div>
        </div>
    );

    const CardSkeleton = () => (
        <Card className="shadow-lg dark:bg-transparent">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
    );

    if (loading) return (
        <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
            {headerContent}
            <CardSkeleton />
            <Alert>
                <AlertDescription>Loading...</AlertDescription>
            </Alert>
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

            {loading ? <CardSkeleton /> : (
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
                            const isMobile = window.innerWidth <= 768; // Assuming 768px as the breakpoint for mobile

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
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent">Stunde</TableHead>
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent">Fach</TableHead>
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent">Lehrer</TableHead>
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent">Raum</TableHead>
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent">Art</TableHead>
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent">Info</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentItem.content.map((item, index) => (
                                <TableRow key={index} className="hover:bg-transparent">
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent">{item.position}</TableCell>
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent">{item.subject}</TableCell>
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent">{item.teacher}</TableCell>
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent">{item.room}</TableCell>
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent">{item.topic}</TableCell>
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent">{item.info}</TableCell>
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
