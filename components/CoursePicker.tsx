import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/className";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import React, { useState } from 'react';

interface CoursePickerProps {
    courses: string[];
    selectedCourse: string;
    onCourseSelect: (course: string) => void;
}

export const CoursePicker: React.FC<CoursePickerProps> = ({
    courses,
    selectedCourse,
    onCourseSelect,
}) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="my-4 flex justify-center">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[240px] justify-between dark:border-neutral-700 dark:text-neutral-200"
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
                        <CommandList className="dark:bg-transparent max-h-[300px]">
                            <CommandEmpty>No course found.</CommandEmpty>
                            <CommandGroup>
                                {courses.map((course) => (
                                    <CommandItem
                                        key={course}
                                        value={course}
                                        className="dark:data-[selected=true]:bg-neutral-600 dark:hover:bg-neutral-700"
                                        onSelect={(val) => {
                                            onCourseSelect(val);
                                            setOpen(false);
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
    );
}; 