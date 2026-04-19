import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersApi } from '../../api';

export const fetchProfile = createAsyncThunk(
  'users/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await usersApi.getProfile();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfileInfo = createAsyncThunk(
  'users/updateProfileInfo',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await usersApi.updateProfile(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  'users/changePassword',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await usersApi.changePassword(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'users/fetchAllUsers',
  async (params, { rejectWithValue }) => {
    try {
      const data = await usersApi.getAllUsers(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users list');
    }
  }
);

export const changeUserRole = createAsyncThunk(
  'users/changeUserRole',
  async ({ userId, payload }, { rejectWithValue }) => {
    try {
      const data = await usersApi.updateUserRole(userId, payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user role');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await usersApi.deleteUserByAdmin(userId);
      return { userId, data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

const initialState = {
  profile: null,
  registeredEvents: [],  // ✅ اتضاف
  organizedEvents: [],   // ✅ اتضاف
  usersList: [],
  isLoading: false,
  error: null,
  successMessage: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearProfileData: (state) => {
      state.profile = null;
      state.registeredEvents = [];
      state.organizedEvents = [];
      state.usersList = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload?.user ?? null;
        // ✅ بيحفظ الـ registeredEvents و organizedEvents من الـ API response
        state.registeredEvents = action.payload?.registeredEvents ?? [];
        state.organizedEvents = action.payload?.organizedEvents ?? [];
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateProfileInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateProfileInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = { ...state.profile, ...action.payload.user };
        state.successMessage = 'Profile updated successfully';
      })
      .addCase(updateProfileInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(changeUserPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.successMessage = 'Password changed successfully';
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.usersList = action.payload?.users ?? [];
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(changeUserRole.fulfilled, (state, action) => {
        state.successMessage = 'User role updated successfully';
        const updatedUser = action.payload?.user;
        const index = state.usersList.findIndex(user => user._id === updatedUser?._id);
        if (index !== -1) {
          state.usersList[index] = updatedUser;
        }
      });

    builder
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.successMessage = 'User deleted successfully';
        state.usersList = state.usersList.filter(user => user._id !== action.payload.userId);
      });
  },
});

export const { clearUserMessages, clearProfileData } = usersSlice.actions;
export default usersSlice.reducer;