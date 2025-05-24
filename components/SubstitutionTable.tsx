import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/className";
import React, { useCallback } from 'react';

interface SubstitutionContent {
    info: string;
    position: string;
    room: string;
    subject: string;
    teacher: string;
    topic: string;
}

interface SubstitutionItem {
    content: SubstitutionContent[];
    date: string;
    id: string;
    weekDay: [string, string];
}

interface SubstitutionTableProps {
    currentItem: SubstitutionItem | null;
    subData: SubstitutionItem[];
    currentPage: number;
    onPageChange: (page: number) => void;
    selectedCourse: string;
    lastUpdate: string;
}

export const SubstitutionTable: React.FC<SubstitutionTableProps> = ({
    currentItem,
    subData,
    currentPage,
    onPageChange,
    selectedCourse,
    lastUpdate,
}) => {
    const formatDate = useCallback((dateString: string) => {
        const [day, month, year] = dateString.split('-');
        return `${day}.${month}.${year}`;
    }, []);

    if (!currentItem) {
        return (
            <Alert>
                <AlertDescription>No substitutions for {selectedCourse}</AlertDescription>
            </Alert>
        );
    }

    return (
        <>
            <Card className="shadow-lg dark:bg-transparent">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl sm:text-2xl font-bold dark:text-white">
                            {currentItem.weekDay[0]}, {formatDate(currentItem.date)}
                        </CardTitle>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {currentItem.content.length} Einträge
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Letzte Änderung: {new Date(lastUpdate).toLocaleString()}
                    </p>
                </CardContent>
            </Card>

            {subData.length > 1 && (
                <div className="overflow-x-auto">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => onPageChange(currentPage - 1)}
                                    className={cn(
                                        "select-none cursor-pointer",
                                        currentPage === 0 ? "opacity-50 pointer-events-none" : ""
                                    )}
                                >
                                    Zurück
                                </PaginationPrevious>
                            </PaginationItem>
                            {subData.map((_, index) => {
                                const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

                                if (!isMobile || index < 4) {
                                    return (
                                        <PaginationItem key={index}>
                                            <PaginationLink
                                                onClick={() => onPageChange(index)}
                                                isActive={currentPage === index}
                                                className="cursor-pointer"
                                            >
                                                {index + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                } else if (isMobile && index === 4) {
                                    return (
                                        <PaginationItem key={index}>
                                            <PaginationLink className="cursor-default">...</PaginationLink>
                                        </PaginationItem>
                                    );
                                }
                                return null;
                            })}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => onPageChange(currentPage + 1)}
                                    className={cn(
                                        "select-none cursor-pointer",
                                        currentPage === subData.length - 1 ? "opacity-50 pointer-events-none" : ""
                                    )}
                                >
                                    Weiter
                                </PaginationNext>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {currentItem.content.length === 0 ? (
                <Alert>
                    <AlertDescription>Keine Vertretungen für {selectedCourse}</AlertDescription>
                </Alert>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent dark:border-neutral-400">
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent" scope="col" id="position">
                                    Stunde
                                </TableHead>
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent" scope="col" id="subject">
                                    Fach
                                </TableHead>
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent" scope="col" id="teacher">
                                    Lehrer
                                </TableHead>
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent" scope="col" id="room">
                                    Raum
                                </TableHead>
                                <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent" scope="col" id="type">
                                    Art
                                </TableHead>
                                {currentItem.content.some(item => item.info) && (
                                    <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent" scope="col" id="info">
                                        Info
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentItem.content.map((item, index) => (
                                <TableRow key={index} className="hover:bg-transparent dark:border-neutral-700">
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent" headers="position">
                                        {item.position}
                                    </TableCell>
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent" headers="subject">
                                        {item.subject}
                                    </TableCell>
                                    <TableCell
                                        className={cn("px-2 py-3 sm:px-4 hover:bg-transparent",
                                            item.teacher.includes('(') && item.teacher.includes(')')
                                                ? 'text-neutral-500'
                                                : ''
                                        )}
                                        headers="teacher"
                                    >
                                        {item.teacher || "---"}
                                    </TableCell>
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent" headers="room">
                                        {item.room}
                                    </TableCell>
                                    <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent" headers="type">
                                        {item.topic === "Selbststudium" ? (
                                            <span className="highlight dark:highlight-amber-800 highlight-amber-500 highlight-variant-1 highlight-spread-sm">
                                                {item.topic}
                                            </span>
                                        ) : (
                                            <span>{item.topic}</span>
                                        )}
                                    </TableCell>
                                    {item.info && (
                                        <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent" headers="info">
                                            {item.info}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </>
    );
}; 