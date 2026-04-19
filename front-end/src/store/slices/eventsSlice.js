import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventsApi } from '../../api';

export const fetchAllEvents = createAsyncThunk(
  'events/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const data = await eventsApi.getEvents(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events');
    }
  }
);

export const fetchEventDetails = createAsyncThunk(
  'events/fetchDetails',
  async (eventId, { rejectWithValue }) => {
    try {
      const data = await eventsApi.getEventById(eventId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event details');
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    eventsList: [],
    pagination: null,
    currentEvent: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.eventsList = action.payload?.events ?? [];
        state.pagination = action.payload?.pagination ?? null;
      })
      .addCase(fetchAllEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchEventDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEvent = action.payload?.event ?? null;
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentEvent } = eventsSlice.actions;
export default eventsSlice.reducer;