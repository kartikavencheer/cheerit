import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { apiClient, UserProfile } from '../api/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  sendOtp: (phone: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cheerit_token'));
  const [isLoading, setIsLoading] = useState(true);
  const didBootRef = useRef(false);

  const clearSession = (opts?: { toastMessage?: string }) => {
    localStorage.removeItem('cheerit_token');
    localStorage.removeItem('cheerit_refresh_token');
    localStorage.removeItem('cheerit_user');
    setUser(null);
    setToken(null);
    if (opts?.toastMessage) toast.info(opts.toastMessage);
  };

  useEffect(() => {
    // React StrictMode runs effects twice in development. Guard to avoid duplicate API calls.
    if (didBootRef.current) return;
    didBootRef.current = true;

    let isMounted = true;

    const checkAuth = async () => {
      const token = localStorage.getItem('cheerit_token');
      const savedUser = localStorage.getItem('cheerit_user');
      if (isMounted) setToken(token);

      if (!token) {
        localStorage.removeItem('cheerit_refresh_token');
        localStorage.removeItem('cheerit_user');
        if (isMounted) setUser(null);
        if (isMounted) setIsLoading(false);
        return;
      }

      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as UserProfile;
          if (isMounted) setUser(parsed);
        } catch {
          localStorage.removeItem('cheerit_user');
        }
      }

      if (isMounted) setIsLoading(false);
    };
    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status === 401 || status === 403) {
          clearSession();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(interceptorId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeMobileNumber = (input: string) => {
    const digits = input.replace(/\D/g, '');
    if (digits.length === 10) return digits;
    if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
    if (digits.length > 10) return digits.slice(-10);
    return digits;
  };

  const toUserProfile = (apiUser: any): UserProfile => {
    return {
      id: String(apiUser?.id ?? apiUser?.user_id ?? ''),
      name: String(apiUser?.full_name ?? apiUser?.name ?? 'User'),
      phone: String(apiUser?.mobile_number ?? apiUser?.phone ?? ''),
      avatar: apiUser?.avatar ?? undefined,
      createdAt: apiUser?.created_at ?? apiUser?.createdAt ?? apiUser?.created_on ?? undefined,
    };
  };

  const sendOtp = async (phone: string) => {
    try {
      const mobileNumber = normalizeMobileNumber(phone);
      const { data } = await apiClient.post<{ success?: boolean; message?: string }>('/auth/request-otp', {
        mobileNumber,
        platform: 'web',
      });
      toast.success(data?.message || 'OTP sent successfully!');
    } catch (error) {
      console.error('Failed to send OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
      throw error;
    }
  };

  const login = async (phone: string, otp: string) => {
    try {
      const mobileNumber = normalizeMobileNumber(phone);
      const { data } = await apiClient.post<{
        success: boolean;
        message?: string;
        accessToken?: string;
        refreshToken?: string;
        user?: any;
        token?: string;
      }>('/auth/verify-otp', { mobileNumber, otpCode: otp, platform: 'web' });

      if (!data?.success) {
        throw new Error(data?.message || 'OTP invalid');
      }

      const token = data.accessToken || data.token;
      if (!token || !data.user) {
        throw new Error('Login response missing token/user');
      }

      localStorage.setItem('cheerit_token', token);
      setToken(token);
      if (data.refreshToken) localStorage.setItem('cheerit_refresh_token', data.refreshToken);

      const nextUser = toUserProfile(data.user);
      setUser(nextUser);
      localStorage.setItem('cheerit_user', JSON.stringify(nextUser));
      toast.success(data.message || 'Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      const message = error instanceof Error ? error.message : 'Invalid OTP or login failed.';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    clearSession({ toastMessage: 'Logged out successfully.' });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user && !!token, isLoading, login, sendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
