// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { doctorApi } from './services/doctorApi';
import { analyticsApi } from './services/analyticsApi';
import { authApi } from './services/authApi';
import { patientApi } from './services/patientApi';
import filtersReducer from './slices/filtersSlice'; 

export const store = configureStore({
  reducer: {
    [doctorApi.reducerPath]: doctorApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [patientApi.reducerPath]: patientApi.reducer,
    filters: filtersReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      doctorApi.middleware,
      analyticsApi.middleware,
      authApi.middleware,
      patientApi.middleware
    ),
});

setupListeners(store.dispatch);