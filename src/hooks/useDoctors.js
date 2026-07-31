import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export function useDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalDoctors: 0, currentPage: 1 });

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

      if (!result.success) throw new Error(result.message || 'Failed to fetch doctors');

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

  const clearFilters = () => {
    setSearch('');
    setSpecialization('All');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return {
    doctors,
    loading,
    error,
    pagination,
    page,
    setPage,
    filters: { search, specialization, startDate, endDate },
    setFilters: { setSearch, setSpecialization, setStartDate, setEndDate },
    clearFilters,
    refreshDoctors: fetchDoctors,
  };
}