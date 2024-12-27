"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TextShimmer } from '@/components/ui/TextShimmer';
import { cn } from "@/lib/utils";
import { Terminal } from "lucide-react";
import React, { useEffect, useState } from 'react';

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

interface LoginResponse {
    access_token: string;
}

// Remove the default value to make it clearer if it's not picking up the env var
const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
    console.warn('NEXT_PUBLIC_API_URL is not set');
}

const SubstitutionTable: React.FC = () => {
    const [data, setData] = useState<SubstitutionData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load saved credentials from localStorage
        const savedUsername = localStorage.getItem('username');
        const savedPassword = localStorage.getItem('password');
        if (savedUsername && savedPassword) {
            setIsLoggingIn(true);
            loginWithCredentials(savedUsername, savedPassword);
        } else {
            setIsLoading(false);
        }
    }, []);

    const loginWithCredentials = async (username: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) {
                throw new Error('Login failed');
            }
            const result: LoginResponse = await response.json();
            setToken(result.access_token);
            // Save credentials to localStorage
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            setError(null);
        } catch (error) {
            setError((error as Error).message);
            // Clear stored credentials on error
            localStorage.removeItem('username');
            localStorage.removeItem('password');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const login = () => {
        if (username && password) {
            loginWithCredentials(username, password);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && username && password) {
            login();
        }
    };

    const isFormValid = username.trim() !== '' && password.trim() !== '';

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;

            try {
                const response = await fetch(`${API_URL}/api/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Authentication failed');
                }
                const result = await response.json();
                setData(result);
            } catch (error) {
                setError((error as Error).message);
                setToken(null);
            } finally {
                setTimeout(() => {
                    setShowSkeleton(false);
                    setIsLoading(false);
                }, 300);
            }
        };

        if (token) {
            fetchData();
        }

        return () => { };
    }, [token]);

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        setUsername('');
        setPassword('');
    };

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

    if (!token) {
        if (isLoggingIn) {
            return (
                <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
                    {headerContent}
                    <CardSkeleton />
                </div>
            );
        }

        return (
            <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto dark:dark">
                {headerContent}
                <Card className="shadow-lg dark:bg-transparent dark:dark">
                    <CardHeader className='dark:dark'>
                        <CardTitle className='dark:dark'>Login</CardTitle>
                    </CardHeader>
                    <CardContent className="dark:dark">
                        <div className="space-y-4 dark:dark">
                            <Input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={handleKeyPress}
                                id="username"
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyPress}
                                id="password"
                            />
                            <Button onClick={login} disabled={!isFormValid}>Login</Button>
                        </div>
                    </CardContent>
                </Card>
                {error && (
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </div>
        );
    }

    if (isLoading || showSkeleton) {
        return (
            <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
                {headerContent}
                <CardSkeleton />
            </div>
        );
    }

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

    if (!data) {
        return (
            <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
                {headerContent}
                <Alert><AlertDescription>No data available</AlertDescription></Alert>
            </div>
        );
    }

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
        <>
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
                {data.substitution.length > 1 && (
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
                )}

                {currentItem.content.length === 0 ? (
                    <Alert>
                        <AlertDescription>Keine Vertretungen für {data.class}</AlertDescription>
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
                                        <TableCell className={`px-2 py-3 sm:px-4 hover:bg-transparent ${item.teacher.includes('(') && item.teacher.includes(')') ? 'text-neutral-500' : ''}`} headers="teacher">
                                            {item.teacher || "---"}
                                        </TableCell>
                                        <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent" headers="room">
                                            {item.room}
                                        </TableCell>
                                        <TableCell className="px-2 py-3 sm:px-4 hover:bg-transparent" headers="type">
                                            {item.topic === "Selbststudium" ? (
                                                <span className="highlight dark:highlight-amber-800 highlight-amber-500 highlight-variant-1 highlight-spread-sm">{item.topic}</span>
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
            </div>
            <footer className="mt-20 mb-8 text-sm text-gray-500 dark:text-neutral-500 text-center space-y-2">
                <div className="flex justify-center mt-8">
                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                    >
                        Logout
                    </Button>
                </div>
                <p className="flex flex-col gap-4">
                    © 2022 - {new Date().getFullYear()} Pertermann. All Rights Reserved.
                    <span>
                        www.dsb.pertermann.de v.{new Date().getFullYear()}.
                        {(new Date().getMonth() + 1).toString().padStart(2, '0')}{' '}(<a href={API_URL} rel="noopener noreferrer" target="_blank" className="hover:underline">view api</a>)
                    </span>
                    <span>
                        Website built for Special Academic Project{' '}(
                        <a
                            href="https://github.com/PrtmPhlp/dsbmobile"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="hover:underline"
                        >
                            view source
                        </a>)
                    </span>
                </p>
            </footer>
        </>
    );
};

export default SubstitutionTable;
