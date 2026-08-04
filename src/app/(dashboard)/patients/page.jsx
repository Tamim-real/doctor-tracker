'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Search,
  Filter,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  UserRound,
  X,
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/DatePicker';

import {
  useGetPatientsQuery,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} from '@/redux/services/patientApi';

import {
  setPatientFilters,
  setPatientPage,
  resetPatientFilters,
} from '@/redux/slices/filtersSlice'; 

export default function PatientsPage() {
  const dispatch = useDispatch();

  // ===== Redux filters state =====
  const {
    search: reduxSearch,
    condition,
    gender,
    startDate,
    endDate,
    page,
  } = useSelector((state) => state.filters.patientFilters);

  // ===== Local state শুধু search input-এর immediate typing feel-এর জন্য =====
  const [searchInput, setSearchInput] = useState(reduxSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // debounced value change hole redux-এ sync করো + page 1-এ reset
  useEffect(() => {
    if (debouncedSearch !== reduxSearch) {
      dispatch(setPatientFilters({ search: debouncedSearch, page: 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // === RTK Query ===
  const { data, isLoading: loading } = useGetPatientsQuery({
    page,
    search: reduxSearch,
    condition,
    gender,
    startDate,
    endDate,
    limit: 5,
  });

  const patients = data?.patients ?? [];
  const pagination = data?.pagination ?? { totalPages: 1, totalPatients: 0, currentPage: 1 };

  const [updatePatient, { isLoading: saving }] = useUpdatePatientMutation();
  const [deletePatient] = useDeletePatientMutation();

  const handleEditClick = (patient) => {
    setSelectedPatient({ ...patient });
    setEditModalOpen(true);
  };

  const executeDelete = async (patientId) => {
    const tid = toast.loading('Deleting...');
    try {
      await deletePatient(patientId).unwrap();
      toast.success('Deleted!', { id: tid });
    } catch {
      toast.error('Failed to delete', { id: tid });
    }
  };

  const handleDeletePatient = (patientId, patientName) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-900">
            Delete patient <span className="font-bold">{patientName}</span>?
          </p>
          <div className="flex justify-end gap-2 mt-1">
            <Button variant="outline" size="sm" onClick={() => toast.dismiss(t.id)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                toast.dismiss(t.id);
                executeDelete(patientId);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  const handleSaveEdit = async () => {
    try {
      await updatePatient(selectedPatient).unwrap();
      toast.success('Patient updated successfully!');
      setEditModalOpen(false);
    } catch {
      toast.error('Failed to update patient');
    }
  };

  const hasActiveFilters =
    reduxSearch || condition || (gender && gender !== 'all') || startDate || endDate;

  const clearFilters = () => {
    setSearchInput('');
    dispatch(resetPatientFilters());
  };

  return (
    <div className="p-8 min-h-screen space-y-6 bg-slate-50/50">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Patient Records
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage all registered patients and their medical history
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Filter condition..."
              value={condition}
              onChange={(e) =>
                dispatch(setPatientFilters({ condition: e.target.value, page: 1 }))
              }
              className="pl-9"
            />
          </div>

          <Select
            value={gender}
            onValueChange={(value) =>
              dispatch(setPatientFilters({ gender: value, page: 1 }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <DatePicker
            value={startDate}
            onChange={(date) =>
              dispatch(setPatientFilters({ startDate: date, page: 1 }))
            }
            placeholder="From Date"
          />

          <DatePicker
            value={endDate}
            onChange={(date) =>
              dispatch(setPatientFilters({ endDate: date, page: 1 }))
            }
            placeholder="To Date"
          />
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Filters applied</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-teal-600 hover:text-teal-700 h-8 px-2"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="w-[250px]">Patient Name</TableHead>
              <TableHead>Age / Gender</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Assigned Doctor</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                    <div className="w-4 h-4 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                    Finding Patients…
                  </div>
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  No patients match your search or filters.
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient._id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-medium text-xs">
                        {patient.name?.charAt(0) || <UserRound size={14} />}
                      </div>
                      <span className="font-semibold text-slate-900">
                        {patient.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-slate-600">
                    {patient.age}y • {patient.gender}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-amber-50 text-amber-700 border-amber-200/60 font-mono text-xs"
                    >
                      {patient.condition}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-slate-700">
                    {patient.doctor?.name ? (
                      `Dr. ${patient.doctor.name}`
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </TableCell>

                  <TableCell className="font-mono text-xs text-slate-600">
                    {patient.phone}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleEditClick(patient)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5 text-slate-500" />
                          Edit details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePatient(patient._id, patient.name)}
                          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/30">
            <p className="font-mono text-xs text-slate-500">
              Page {pagination.currentPage} of {pagination.totalPages}
              <span className="text-slate-700 font-sans ml-2">
                ({pagination.totalPatients} patients total)
              </span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => dispatch(setPatientPage(Math.max(page - 1, 1)))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => dispatch(setPatientPage(page + 1))}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Patient Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Patient Details</DialogTitle>
          </DialogHeader>

          {selectedPatient && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Name</label>
                <Input
                  className="col-span-3"
                  value={selectedPatient.name || ''}
                  onChange={(e) =>
                    setSelectedPatient({ ...selectedPatient, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Age</label>
                <Input
                  type="number"
                  className="col-span-3"
                  value={selectedPatient.age || ''}
                  onChange={(e) =>
                    setSelectedPatient({ ...selectedPatient, age: Number(e.target.value) })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Condition</label>
                <Input
                  className="col-span-3"
                  value={selectedPatient.condition || ''}
                  onChange={(e) =>
                    setSelectedPatient({ ...selectedPatient, condition: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Phone</label>
                <Input
                  className="col-span-3"
                  value={selectedPatient.phone || ''}
                  onChange={(e) =>
                    setSelectedPatient({ ...selectedPatient, phone: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}