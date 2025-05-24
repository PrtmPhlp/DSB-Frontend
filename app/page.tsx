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
import { TextShimmer } from '@/components/TextShimmer';
import { cn } from "@/lib/className";
import { Terminal, Check, ChevronsUpDown } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// SHADCN combobox imports
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Toggle } from "@/components/ui/toggle";

// Types
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

interface CourseData {
  substitution: SubstitutionItem[];
}

interface MultiCourseData {
  createdAt: string;
  // Each key is a course name: "5a", "MSS12", etc.
  courses: Record<string, CourseData>;
}

// Constants
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.home.pertermann.de';

// Add new error type
interface ApiError {
  status: number;
  message: string;
}

// Main component
const SubstitutionTable: React.FC = () => {
  // State
  const [data, setData] = useState<MultiCourseData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [openCombo, setOpenCombo] = useState(false);
  const [apiError] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyCancelled, setShowOnlyCancelled] = useState(false);

  // Memoized values
  const isFormValid = useMemo(() =>
    username.trim() !== '' && password.trim() !== '',
    [username, password]
  );

  const courseNames = useMemo(() => {
    if (!data) return [];

    // Get all course names from data
    const courses = Object.keys(data.courses);

    // Sort function: MSS first, then by grade number
    return courses.sort((a, b) => {
      // MSS courses should come first
      const aIsMSS = a.startsWith('MSS');
      const bIsMSS = b.startsWith('MSS');

      if (aIsMSS && !bIsMSS) return -1;
      if (!aIsMSS && bIsMSS) return 1;

      if (aIsMSS && bIsMSS) {
        // Sort MSS courses by their number (MSS11, MSS12, etc.)
        const aNum = parseInt(a.replace('MSS', ''));
        const bNum = parseInt(b.replace('MSS', ''));
        return aNum - bNum;
      }

      // For non-MSS courses, extract the numeric part
      const aMatch = a.match(/^(\d+)/);
      const bMatch = b.match(/^(\d+)/);

      if (aMatch && bMatch) {
        const aNum = parseInt(aMatch[0]);
        const bNum = parseInt(bMatch[0]);

        // First sort by the number
        if (aNum !== bNum) {
          return aNum - bNum;
        }

        // If numbers are the same, sort alphabetically by the suffix
        return a.localeCompare(b);
      }

      // Fallback to simple alphabetical sort
      return a.localeCompare(b);
    });
  }, [data]);

  const subData = useMemo(() => {
    const substitution = data?.courses[selectedCourse]?.substitution || [];

    // Sort substitution data by date
    return [...substitution].sort((a, b) => {
      // Parse dates in format DD-MM-YYYY
      const [dayA, monthA, yearA] = a.date.split('-').map(Number);
      const [dayB, monthB, yearB] = b.date.split('-').map(Number);

      // Compare years first
      if (yearA !== yearB) return yearA - yearB;
      // Then months
      if (monthA !== monthB) return monthA - monthB;
      // Then days
      return dayA - dayB;
    });
  }, [data, selectedCourse]);

  const currentItem = useMemo(() =>
    subData[currentPage] || null,
    [subData, currentPage]
  );

  const filteredContent = useMemo(() => {
    if (!currentItem?.content) return [];

    let filtered = currentItem.content;

    if (showOnlyCancelled) {
      filtered = filtered.filter(item =>
        item.topic === "Selbststudium" || item.topic === "Fällt aus"
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.teacher.toLowerCase().includes(query) ||
        item.room.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.topic.toLowerCase().includes(query) ||
        item.info.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [currentItem?.content, searchQuery, showOnlyCancelled]);

  // Add error message helper
  const getErrorMessage = useCallback((error: ApiError) => {
    switch (error.status) {
      case 401:
        return 'Bitte überprüfen Sie Ihre Anmeldedaten';
      case 403:
        return 'Sie haben keine Berechtigung für diese Aktion';
      case 404:
        return 'Die angeforderte Ressource wurde nicht gefunden';
      case 500:
        return 'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut';
      default:
        return error.message;
    }
  }, []);

  // Callbacks
  const loginWithCredentials = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw {
          status: response.status,
          message: errorResponse.error || 'Login fehlgeschlagen'
        };
      }

      // Set a dummy token since we're using HTTP-only cookies
      setToken('authenticated');
      setError(null);

      // Save credentials to localStorage
      localStorage.setItem('username', username);
      localStorage.setItem('password', password);
    } catch (error) {
      setError(error as ApiError);
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const login = useCallback(() => {
    if (isFormValid) {
      setIsLoggingIn(true);
      loginWithCredentials(username, password);
    }
  }, [isFormValid, loginWithCredentials, username, password]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid) {
      login();
    }
  }, [isFormValid, login]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setToken(null);
      setUsername('');
      setPassword('');

      // Clear saved credentials
      localStorage.removeItem('username');
      localStorage.removeItem('password');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage(prev => (prev < subData.length - 1 ? prev + 1 : prev));
  }, [subData.length]);

  const formatDate = useCallback((dateString: string) => {
    const [day, month, year] = dateString.split('-');
    return `${day}.${month}.${year}`;
  }, []);

  // Effects
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');

    if (savedUsername && savedPassword) {
      setIsLoggingIn(true);
      loginWithCredentials(savedUsername, savedPassword);
    } else {
      setIsLoading(false);
    }
  }, [loginWithCredentials]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/substitutions');

        if (!response.ok) {
          const error = await response.json();
          throw {
            status: response.status,
            message: error.error || 'Daten konnten nicht geladen werden'
          };
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error as ApiError);
        setToken(null);
      } finally {
        // Use a single timeout for loading state
        setTimeout(() => {
          setIsLoading(false);
        }, 300); // Slightly longer delay for smoother loading
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    if (!data) return;

    // Get saved course from localStorage if available
    const savedCourse = localStorage.getItem('selectedCourse');

    if (selectedCourse === "") {
      if (savedCourse && courseNames.includes(savedCourse)) {
        // Use the saved course if it exists in the current data
        setSelectedCourse(savedCourse);
      } else if (courseNames.length > 0) {
        // Otherwise fallback to first course
        setSelectedCourse(courseNames[0]);
      }
      setCurrentPage(0);
    }
  }, [data, selectedCourse, courseNames]);

  // Save selected course to localStorage whenever it changes
  useEffect(() => {
    if (selectedCourse) {
      localStorage.setItem('selectedCourse', selectedCourse);
    }
  }, [selectedCourse]);

  // UI Components
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

  // const ComboboxSkeleton = () => (
  //   <div className="my-4 flex justify-center">
  //     <Skeleton className={cn("h-10 w-[240px]", "dark:bg-neutral-800")} />
  //   </div>
  // );

  const headerContent = (
    <div className="py-6 md:py-12 dark:border-gray-800 flex justify-center">
      <div>
        <h1 className="text-3xl sm:text-4xl tracking-tighter md:text-5xl font-bold text-black text-center dark:text-white">
          Vertretungsplan
        </h1>
        {isLoading ? (
          <Skeleton className={cn("h-6 w-55 mx-auto mt-2", "dark:bg-neutral-800")} />
        ) : (
          <div
            className={`
              text-gray-500 text-lg text-center mt-2 md:text-xl/relaxed xl:text-xl/relaxed dark:text-neutral-400
              ${error || data ? 'visible' : 'invisible'}
            `}
          >
            {error ? (
              <TextShimmer
                duration={1.2}
                className='text-xl font-medium [--base-color:theme(colors.red.600)] [--base-gradient-color:theme(colors.red.200)] dark:[--base-color:theme(colors.red.700)] dark:[--base-gradient-color:theme(colors.red.400)]'
              >
                konnte nicht geladen werden
              </TextShimmer>
            ) : (
              <>
                {selectedCourse && (
                  <>Vertretungsplan für <b className="dark:text-gray-300">{selectedCourse}</b></>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Conditional renders
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
                autoComplete="username"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
                id="password"
                autoComplete="current-password"
              />
              <Button onClick={login} disabled={!isFormValid}>Login</Button>
            </div>
          </CardContent>
        </Card>
        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Fehler</AlertTitle>
            <AlertDescription>
              {getErrorMessage(error)}
              {error.status === 401 && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUsername('');
                      setPassword('');
                      setError(null);
                    }}
                  >
                    Erneut versuchen
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
        {headerContent}
        {/* <ComboboxSkeleton /> */}
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
        {headerContent}
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>
            {getErrorMessage(error)}
            {error.status === 401 && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUsername('');
                    setPassword('');
                    setError(null);
                  }}
                >
                  Erneut versuchen
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
        {headerContent}
        <Alert>
          <AlertDescription>No data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (courseNames.length === 0) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
        {headerContent}
        <Alert>
          <AlertDescription>No courses found in data</AlertDescription>
        </Alert>
      </div>
    );
  }

  // If API_URL is not properly configured, show a warning
  if (apiError) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
        {headerContent}
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            The API URL is not properly configured. Please set the NEXT_PUBLIC_API_URL environment variable.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Main render
  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
      {headerContent}

      {/* Display content */}
      {!currentItem ? (
        <Alert>
          <AlertDescription>No substitutions for {selectedCourse}</AlertDescription>
        </Alert>
      ) : (
        <>
          <Card className="shadow-lg dark:bg-transparent">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl sm:text-2xl font-bold dark:text-white">
                  {currentItem.weekDay[0]}, {formatDate(currentItem.date)}
                </CardTitle>
                <span className="text-sm font-medium text-gray-500 dark:text-neutral-400">
                  {filteredContent.filter(item => item.topic === "Selbststudium" || item.topic === "Fällt aus").length} Ausfälle
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                Letzte Änderung: {new Date(data.createdAt).toLocaleString("de-DE", {
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </p>
            </CardContent>
          </Card>

          {/* Create a flex container that puts dropdown and search side-by-side */}
          <div className="flex flex-col sm:flex-row gap-4 my-4 items-center">
            {/* Course dropdown */}
            <div className="w-full sm:w-auto px-4 sm:px-0">
              <Popover open={openCombo} onOpenChange={setOpenCombo}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombo}
                    className="w-full sm:w-[240px] justify-between dark:border-neutral-700 dark:text-neutral-200 cursor-pointer"
                  >
                    {selectedCourse || "Select a course..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200">
                  <Command className="dark:bg-transparent">
                    <CommandInput
                      placeholder="Search course..."
                      className="dark:border-neutral-600 dark:text-neutral-200"
                    />
                    <CommandList className="dark:bg-transparent max-h-[250px]">
                      <CommandEmpty>No course found.</CommandEmpty>
                      <CommandGroup>
                        {courseNames.map((course) => (
                          <CommandItem
                            key={course}
                            value={course}
                            className="dark:data-[selected=true]:bg-neutral-600 dark:hover:bg-neutral-700"
                            onSelect={(val) => {
                              setSelectedCourse(val);
                              setCurrentPage(0);
                              setOpenCombo(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCourse === course ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {course}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Search field */}
            <div className="w-full sm:flex-1 px-4 sm:px-0">
              <div className="flex gap-4 items-center">
                <Input
                  type="text"
                  placeholder="Suche nach Lehrer, Raum, Fach..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md text-sm"
                />
                <Toggle
                  variant="outline"
                  pressed={showOnlyCancelled}
                  onPressedChange={setShowOnlyCancelled}
                  aria-label="Nur Ausfälle anzeigen"
                  className="px-4 cursor-pointer"
                >
                  Ausfälle
                </Toggle>
              </div>
            </div>
          </div>

          {/* Replace with old pagination and add integrated search */}
          {subData.length > 1 && (
            <div className="overflow-x-auto">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={handlePrevious}
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
                            onClick={() => setCurrentPage(index)}
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
                      onClick={handleNext}
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

          {filteredContent.length === 0 ? (
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
                    {filteredContent.some(item => item.info) && (
                      <TableHead className="px-2 py-3 sm:px-4 hover:bg-transparent" scope="col" id="info">
                        Info
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((item, index) => (
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
                        {item.topic === "Selbststudium" || item.topic === "Fällt aus" ? (
                          <span className="highlight highlight-amber-500 highlight-variant-1 highlight-spread-sm">
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
      )}

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
            {(new Date().getMonth() + 1).toString().padStart(2, '0')}{' '}(
            <a href={API_URL} rel="noopener noreferrer" target="_blank" className="hover:underline">view api</a>)
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
    </div>
  );
};

export default SubstitutionTable;
