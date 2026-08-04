import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const patientApi = createApi({
  reducerPath: 'patientApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
  }),
  tagTypes: ['Patient'],
  endpoints: (builder) => ({
    getPatients: builder.query({
      query: ({ search = '', condition = '', gender = 'all', startDate, endDate, page = 1, limit = 5 } = {}) => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (condition) params.set('condition', condition);
        if (gender !== 'all') params.set('gender', gender);
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        params.set('page', page);
        params.set('limit', limit);
        return `/patients?${params.toString()}`;
      },
      transformResponse: (response) => ({
        patients: response.data || [],
        pagination: response.pagination || {},
      }),
      providesTags: (result) =>
        result?.patients
          ? [
              ...result.patients.map(({ _id }) => ({ type: 'Patient', id: _id })),
              { type: 'Patient', id: 'LIST' },
            ]
          : [{ type: 'Patient', id: 'LIST' }],
    }),

    updatePatient: builder.mutation({
      query: ({ _id, ...updates }) => ({
        url: `/patients/${_id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: 'Patient', id: _id },
        { type: 'Patient', id: 'LIST' },
      ],
    }),

    deletePatient: builder.mutation({
      query: (patientId) => ({
        url: `/patients/${patientId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, patientId) => [
        { type: 'Patient', id: patientId },
        { type: 'Patient', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = patientApi;