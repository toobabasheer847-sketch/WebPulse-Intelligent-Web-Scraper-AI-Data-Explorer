import { create } from 'zustand';
import { authApi } from '@/lib/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('webpulse_user') || 'null'),
  token: localStorage.getItem('webpulse_token'),
  loading: false,
  resendLoading: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem('webpulse_user', JSON.stringify(user));
    localStorage.setItem('webpulse_token', token);
    set({ user, token, error: null });
  },

  logout: () => {
    localStorage.removeItem('webpulse_user');
    localStorage.removeItem('webpulse_token');
    set({ user: null, token: null });
  },

  login: async (email, password) => {
    console.log("🔑 [authStore.login] Starting login attempt for email:", email);
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.login({ email, password });
      console.log("🔑 [authStore.login] API response received:", data);
      
      if (data.require2FA) {
        console.log("🔑 [authStore.login] 2FA required, returning temp token");
        set({ loading: false });
        return data;
      }

      console.log("🔑 [authStore.login] Saving user and token to localStorage and state");
      localStorage.setItem('webpulse_user', JSON.stringify(data.user));
      localStorage.setItem('webpulse_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      
      console.log("🔑 [authStore.login] State updated successfully!", {
        user: data.user,
        token: data.token
      });
      
      return data;
    } catch (err) {
      console.error('❌ [authStore.login] Login failed:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        responseData: err.response?.data,
        requestUrl: err.config?.url,
      });
      let message =
        err.response?.data?.error?.message ||
        (err.code === 'ERR_NETWORK' ? 'Cannot reach server. Is the backend running?' : null) ||
        'Login failed';
      const unverified = err.response?.data?.unverified;
      const errorEmail = err.response?.data?.email;
      set({ loading: false, error: message });
      throw { message, unverified, email: errorEmail };
    }
  },

  verifyLogin2FA: async (tempToken, code) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.verifyLogin2FA(tempToken, code);
      localStorage.setItem('webpulse_user', JSON.stringify(data.user));
      localStorage.setItem('webpulse_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      console.error('❌ [authStore.verifyLogin2FA] 2FA verification failed:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        responseData: err.response?.data,
        requestUrl: err.config?.url,
      });
      const message =
        err.response?.data?.error?.message ||
        (err.code === 'ERR_NETWORK' ? 'Cannot reach server. Is the backend running?' : null) ||
        '2FA verification failed';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.register({ name, email, password });
      set({ loading: false });
      return data;
    } catch (err) {
      console.error('❌ [authStore.register] Registration failed:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        responseData: err.response?.data,
        requestUrl: err.config?.url,
      });
      const message =
        err.response?.data?.error?.message ||
        (err.code === 'ERR_NETWORK' ? 'Cannot reach server. Is the backend running?' : null) ||
        'Registration failed';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  verifyOtp: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.verifyOtp({ email, otp });
      localStorage.setItem('webpulse_user', JSON.stringify(data.user));
      localStorage.setItem('webpulse_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      console.error('❌ [authStore.verifyOtp] Verification failed:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        responseData: err.response?.data,
        requestUrl: err.config?.url,
      });
      const message =
        err.response?.data?.error?.message ||
        (err.code === 'ERR_NETWORK' ? 'Cannot reach server. Is the backend running?' : null) ||
        'Verification failed';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  resendOtp: async (email) => {
    set({ resendLoading: true, error: null });
    try {
      const { data } = await authApi.resendOtp({ email });
      set({ resendLoading: false });
      return data;
    } catch (err) {
      console.error('❌ [authStore.resendOtp] Resend failed:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        responseData: err.response?.data,
        requestUrl: err.config?.url,
      });
      const message =
        err.response?.data?.error?.message ||
        (err.code === 'ERR_NETWORK' ? 'Cannot reach server. Is the backend running?' : null) ||
        'Resend failed';
      set({ resendLoading: false, error: message });
      throw new Error(message);
    }
  },

  fetchMe: async () => {
    try {
      const { data } = await authApi.me();
      localStorage.setItem('webpulse_user', JSON.stringify(data.user));
      set({ user: data.user });
    } catch {
      set({ user: null, token: null });
    }
  },

  updateUser: (updatedUser) => {
    localStorage.setItem('webpulse_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));
