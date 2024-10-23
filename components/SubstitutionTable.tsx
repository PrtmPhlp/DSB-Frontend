"use client";

import React, { useEffect, useState } from 'react';
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < data.substitution.length - 1 ? prev + 1 : prev));
  };

  const currentItem = data.substitution[currentPage];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Substitution Plan for {data.class}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Created at: {new Date(data.createdAt).toLocaleString()}</p>
          <p>Date: {currentItem.date}</p>
          <p>Day: {currentItem.weekDay[1]}</p>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Position</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Info</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItem.content.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.position}</TableCell>
              <TableCell>{item.subject}</TableCell>
              <TableCell>{item.teacher}</TableCell>
              <TableCell>{item.room}</TableCell>
              <TableCell>{item.topic}</TableCell>
              <TableCell>{item.info}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={handlePrevious} />
          </PaginationItem>
          {data.substitution.map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                onClick={() => setCurrentPage(index)}
                isActive={currentPage === index}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext onClick={handleNext} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default SubstitutionTable;
