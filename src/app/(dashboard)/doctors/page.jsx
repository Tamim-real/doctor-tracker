'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import DoctorStats from '@/components/DoctorStats';
import {
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Loader2,
  RotateCcw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DatePicker } from '@/components/ui/DatePicker';

const SPECIALIZATIONS = [
  'All',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'General Medicine',
];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalDoctors: 0,
    currentPage: 1,
  });

  const [deletingId, setDeletingId] = useState(null);
  const [openPopoverId, setOpenPopoverId] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(specialization !== 'All' && { specialization }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const res = await fetch(`/api/doctors?${queryParams.toString()}`);
      const result = await res.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch doctors');
      }

      setDoctors(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, specialization, startDate, endDate]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
      const result = await res.json();

      if (result.success) {
        fetchDoctors();
      } else {
        setError(result.message || 'Delete failed');
      }
    } catch (err) {
      setError('Error deleting doctor');
    } finally {
      setDeletingId(null);
      setOpenPopoverId(null);
    }
  };

  const hasActiveFilters =
    search || specialization !== 'All' || startDate || endDate;

  const clearFilters = () => {
    setSearch('');
    setSpecialization('All');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6 p-8 min-h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Doctor Records
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all doctors and their patient assignments
          </p>
        </div>
        <Button asChild className="bg-teal-700 hover:bg-teal-800 text-white shrink-0">
          <Link href="/doctors/new" className="inline-flex items-center justify-center whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4 shrink-0" />
            <span>Add New Doctor</span>
          </Link>
        </Button>
      </div>

      {/* Analytics Dashboard */}
      <DoctorStats
        doctors={doctors}
        totalDoctors={pagination.totalDoctors}
        loading={loading}
      />

      {/* Filters Card */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Name or specialty…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Specialization Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Specialization
              </label>
              <Select
                value={specialization}
                onValueChange={(val) => {
                  setSpecialization(val);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATIONS.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                From Date
              </label>
              <DatePicker
                value={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  setPage(1);
                }}
                placeholder="Select start date"
              />
            </div>

            {/* To Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                To Date
              </label>
              <DatePicker
                value={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  setPage(1);
                }}
                placeholder="Select end date"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-teal-700 hover:text-teal-800 hover:bg-teal-50 px-2 h-auto text-xs font-semibold"
              >
                <RotateCcw className="mr-1 h-3 w-3" /> Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-2 border-b">
                  <div className="flex items-center gap-3 w-1/4">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-8 w-28 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm font-medium text-destructive bg-destructive/10 m-4 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[280px]">Doctor Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Phone / Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No doctors match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  doctors.map((doctor) => (
                    <TableRow key={doctor._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                            <Stethoscope className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-foreground">
                            {doctor.name}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-mono text-xs"
                        >
                          {doctor.specialization}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {doctor.hospital}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-medium text-foreground">
                            {doctor.phone}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {doctor.email}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs font-semibold"
                          >
                            <Link href={`/doctors/${doctor._id}`}>
                              View Patients
                            </Link>
                          </Button>

                          <Popover
                            open={openPopoverId === doctor._id}
                            onOpenChange={(open) =>
                              setOpenPopoverId(open ? doctor._id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs font-semibold"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              align="end"
                              className="w-60 p-4 space-y-3"
                            >
                              <p className="text-xs font-medium text-foreground">
                                Are you sure you want to delete this doctor?
                              </p>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setOpenPopoverId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 text-xs"
                                  disabled={deletingId === doctor._id}
                                  onClick={() => handleDelete(doctor._id)}
                                >
                                  {deletingId === doctor._id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    'Confirm'
                                  )}
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-border">
                <p className="text-xs font-mono text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages}
                  <span className="font-sans text-muted-foreground ml-2">
                    ({pagination.totalDoctors} doctors total)
                  </span>
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pagination.totalPages}
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, pagination.totalPages))
                    }
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}