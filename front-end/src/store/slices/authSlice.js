import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../api/authApi';

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistAuth(user, accessToken) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  else localStorage.removeItem('accessToken');
  if (user) localStorage.setItem('user', JSON.stringify(user));
  else localStorage.removeItem('user');
}

function clearPersistedAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  // ✅ امسح الـ refresh token cookie يدوياً كـ fallback
  document.cookie = 'refreshToken=; Max-Age=0; path=/; secure; samesite=strict';
}

function getErrorMessage(err) {
  const data = err?.response?.data;
  if (typeof data?.message === 'string') return data.message;
  if (Array.isArray(data?.errors) && data.errors[0]?.message) {
    return data.errors[0].message;
  }
  return err?.message || 'Request failed';
}

const initialState = {
  user: readStoredUser(),
  accessToken: localStorage.getItem('accessToken'),
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authApi.login(credentials);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.signup(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      return await authApi.logout();
    } catch (err) {
      // ✅ حتى لو الـ logout فشل، امسح كل حاجة من الـ client
      clearPersistedAuth();
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const refreshSession = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      return await authApi.refreshAccessToken();
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, accessToken } = action.payload;
      state.user = user ?? null;
      state.accessToken = accessToken ?? null;
      state.error = null;
      persistAuth(state.user, state.accessToken);
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
      if (action.payload) localStorage.setItem('accessToken', action.payload);
      else localStorage.removeItem('accessToken');
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.error = null;
      state.status = 'idle';
      clearPersistedAuth();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload.user ?? null;
        state.accessToken = action.payload.accessToken ?? null;
        state.error = null;
        persistAuth(state.user, state.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload ?? 'Login failed';
      })
      .addCase(signupUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.status = 'idle';
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload ?? 'Signup failed';
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'idle';
        state.user = null;
        state.accessToken = null;
        state.error = null;
        clearPersistedAuth();
      })
      .addCase(logoutUser.rejected, (state) => {
        // ✅ حتى لو الـ logout فشل، امسح الـ state
        state.status = 'idle';
        state.user = null;
        state.accessToken = null;
        state.error = null;
        clearPersistedAuth();
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken ?? null;
        if (state.accessToken) localStorage.setItem('accessToken', state.accessToken);
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        clearPersistedAuth();
      });
  },
});

export const { setCredentials, setAccessToken, clearAuth, clearAuthError } =
  authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => Boolean(state.auth.accessToken);
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;