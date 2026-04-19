import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registrationsApi } from '../../api';

export const registerEvent = createAsyncThunk(
  'registrations/registerEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const data = await registrationsApi.registerForEvent(eventId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to register for event');
    }
  }
);

export const cancelEventRegistration = createAsyncThunk(
  'registrations/cancelEventRegistration',
  async (eventId, { rejectWithValue }) => {
    try {
      const data = await registrationsApi.cancelRegistration(eventId);
      return { eventId, ...data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel registration');
    }
  }
);

export const fetchEventAttendees = createAsyncThunk(
  'registrations/fetchEventAttendees',
  async (eventId, { rejectWithValue }) => {
    try {
      const data = await registrationsApi.getEventAttendees(eventId);
      return { eventId, ...data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendees');
    }
  }
);

const registrationsSlice = createSlice({
  name: 'registrations',
  initialState: {
    latestTicket: null,
    attendeesByEvent: {},
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearRegistrationMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.latestTicket = action.payload?.ticket ?? null;
        state.successMessage = action.payload?.message ?? 'Registered successfully';
      })
      .addCase(registerEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(cancelEventRegistration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(cancelEventRegistration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload?.message ?? 'Registration cancelled successfully';
      })
      .addCase(cancelEventRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchEventAttendees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventAttendees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attendeesByEvent[action.payload.eventId] = action.payload?.registrations ?? [];
      })
      .addCase(fetchEventAttendees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRegistrationMessages } = registrationsSlice.actions;
export default registrationsSlice.reducer;