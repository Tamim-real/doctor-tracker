import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
  }),
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      query: () => '/analytics',
      transformResponse: (response) => response.data,
      providesTags: ['Analytics'],
    }),
  }),
});

export const { useGetAnalyticsQuery } = analyticsApi;