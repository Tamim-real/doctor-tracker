import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const doctorApi = createApi({
  reducerPath: 'doctorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
  }),
  tagTypes: ['Doctor', 'Patient'],
  endpoints: (builder) => ({
    // ===== Doctors =====
    getDoctors: builder.query({
      query: ({ search = '', specialization = '', startDate, endDate, page = 1, limit = 5 } = {}) => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (specialization) params.set('specialization', specialization);
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        params.set('page', page);
        params.set('limit', limit);
        return `/doctors?${params.toString()}`;
      },
      transformResponse: (response) => ({
        doctors: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result?.doctors
          ? [
              ...result.doctors.map(({ _id }) => ({ type: 'Doctor', id: _id })),
              { type: 'Doctor', id: 'LIST' },
            ]
          : [{ type: 'Doctor', id: 'LIST' }],
    }),

    getDoctorById: builder.query({
      query: (id) => `/doctors/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Doctor', id }],
    }),

    addDoctor: builder.mutation({
      query: (newDoctor) => ({
        url: '/doctors',
        method: 'POST',
        body: newDoctor,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: [{ type: 'Doctor', id: 'LIST' }],
    }),

    deleteDoctor: builder.mutation({
      query: (id) => ({
        url: `/doctors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Doctor', id },
        { type: 'Doctor', id: 'LIST' },
      ],
    }),

    // ===== Patients (doctor-scoped) =====
    getDoctorPatients: builder.query({
      query: (doctorId) => `/doctors/${doctorId}/patients`,
      transformResponse: (response) => response.data || [],
      providesTags: (result, error, doctorId) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Patient', id: _id })),
              { type: 'Patient', id: `LIST-${doctorId}` },
            ]
          : [{ type: 'Patient', id: `LIST-${doctorId}` }],
    }),

    addPatient: builder.mutation({
      query: ({ doctorId, ...patientData }) => ({
        url: `/doctors/${doctorId}/patients`,
        method: 'POST',
        body: patientData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { doctorId }) => [
        { type: 'Patient', id: `LIST-${doctorId}` },
      ],
    }),

    deletePatient: builder.mutation({
      query: ({ patientId }) => ({
        url: `/patients/${patientId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { patientId, doctorId }) => [
        { type: 'Patient', id: patientId },
        { type: 'Patient', id: `LIST-${doctorId}` },
      ],
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useAddDoctorMutation,
  useDeleteDoctorMutation,
  useGetDoctorPatientsQuery,
  useAddPatientMutation,
  useDeletePatientMutation,
} = doctorApi;