import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  doctorFilters: {
    search: '',
    specialization: 'All',
    startDate: '',
    endDate: '',
    page: 1,
  },
  patientFilters: {
    search: '',
    condition: '',
    gender: 'all',
    startDate: '',
    endDate: '',
    page: 1,
  },
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // ===== Doctor filters =====
    setDoctorFilters: (state, action) => {
      // partial update — শুধু যা পাঠানো হচ্ছে সেটাই merge হবে
      state.doctorFilters = { ...state.doctorFilters, ...action.payload };
    },
    setDoctorPage: (state, action) => {
      state.doctorFilters.page = action.payload;
    },
    resetDoctorFilters: (state) => {
      state.doctorFilters = initialState.doctorFilters;
    },

    // ===== Patient filters =====
    setPatientFilters: (state, action) => {
      state.patientFilters = { ...state.patientFilters, ...action.payload };
    },
    setPatientPage: (state, action) => {
      state.patientFilters.page = action.payload;
    },
    resetPatientFilters: (state) => {
      state.patientFilters = initialState.patientFilters;
    },
  },
});

export const {
  setDoctorFilters,
  setDoctorPage,
  resetDoctorFilters,
  setPatientFilters,
  setPatientPage,
  resetPatientFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;