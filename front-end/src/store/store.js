import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventsReducer from './slices/eventsSlice';
import categoriesReducer from './slices/categoriesSlice';
import registrationsReducer from './slices/registrationsSlice';
import usersReducer from './slices/userSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    categories: categoriesReducer,
    registrations: registrationsReducer,
    users: usersReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});