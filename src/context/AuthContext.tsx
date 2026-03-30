import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { apiClient, fetchUserDetails, normalizeUserProfile, UserProfile } from '../api/client';
import { toast } from 'sonner';

export class NotRegisteredError extends Error {
  constructor(message?: string) {
    super(message || 'You are not registered. Please register using our app on the Play Store.');
    this.name = 'NotRegisteredError';
  }
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  sendOtp: (phone: string) => Promise<void>;
  refreshUserDetails: () => Promise<UserProfile | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cheerit_token'));
  const [isLoading, setIsLoading] = useState(true);
  const didBootRef = useRef(false);

  const mergeUserProfiles = (current: UserProfile | null, incoming: UserProfile): UserProfile => {
    return {
      id: incoming.id || current?.id || '',
      name: incoming.name || current?.name || 'User',
      phone: incoming.phone || current?.phone || '',
      email: incoming.email || current?.email || undefined,
      avatar: incoming.avatar || current?.avatar || undefined,
      createdAt: incoming.createdAt || current?.createdAt || undefined,
      verified: incoming.verified ?? current?.verified ?? undefined,
      countryCode: incoming.countryCode || current?.countryCode || undefined,
      gender: incoming.gender || current?.gender || undefined,
      emailVerified: incoming.emailVerified ?? current?.emailVerified ?? undefined,
      isActive: incoming.isActive ?? current?.isActive ?? undefined,
      isBlocked: incoming.isBlocked ?? current?.isBlocked ?? undefined,
      allowNotifications: incoming.allowNotifications ?? current?.allowNotifications ?? undefined,
      postalCode: incoming.postalCode !== undefined ? incoming.postalCode : current?.postalCode,
      cityName: incoming.cityName !== undefined ? incoming.cityName : current?.cityName,
      stateName: incoming.stateName !== undefined ? incoming.stateName : current?.stateName,
      country: incoming.country !== undefined ? incoming.country : current?.country,
      updatedAt: incoming.updatedAt || current?.updatedAt || undefined,
    };
  };

  const persistUser = (profile: UserProfile) => {
    localStorage.setItem('cheerit_user', JSON.stringify(profile));
  };

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

      // Refresh profile details in the background (email, avatar, verification, etc.)
      try {
        const seed = savedUser ? (JSON.parse(savedUser) as UserProfile) : null;
        const fetched = await fetchUserDetails(seed?.id);
        if (!isMounted) return;
        const merged = mergeUserProfiles(seed, fetched);
        setUser(merged);
        persistUser(merged);
      } catch (error) {
        // Silent: profile page can still work with cached/login data
        console.warn('Failed to refresh user details:', error);
      }
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

  const getApiErrorInfo = (error: unknown): { status?: number; message: string } => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as any;
      const messageFromBody =
        typeof data === 'string'
          ? data
          : typeof data?.message === 'string'
            ? data.message
            : typeof data?.error === 'string'
              ? data.error
              : typeof data?.detail === 'string'
                ? data.detail
                : undefined;
      return { status, message: messageFromBody || error.message || 'Request failed' };
    }

    const message = error instanceof Error ? error.message : 'Request failed';
    return { message };
  };

  const isNotRegisteredError = (info: { status?: number; message: string }) => {
    if (info.status === 404) return true;
    return /(not\s+registered|user\s+not\s+found|no\s+user|please\s+register)/i.test(info.message);
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
      const info = getApiErrorInfo(error);
      if (isNotRegisteredError(info)) {
        throw new NotRegisteredError('You are not registered. Kindly register using our app from the Play Store.');
      }
      toast.error(info.message || 'Failed to send OTP. Please try again.');
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

      const nextUser = normalizeUserProfile(data.user);
      setUser(nextUser);
      persistUser(nextUser);

      // Fetch full profile from API/DB after login (email, gender, profile pic, etc.)
      try {
        const fetched = await fetchUserDetails(nextUser.id);
        const merged = mergeUserProfiles(nextUser, fetched);
        setUser(merged);
        persistUser(merged);
      } catch (error) {
        console.warn('Failed to fetch full user profile after login:', error);
      }
      toast.success(data.message || 'Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      const info = getApiErrorInfo(error);
      if (isNotRegisteredError(info)) {
        throw new NotRegisteredError('You are not registered. Kindly register using our app from the Play Store.');
      }
      toast.error(info.message || 'Invalid OTP or login failed.');
      throw error;
    }
  };

  const logout = () => {
    clearSession({ toastMessage: 'Logged out successfully.' });
  };

  const refreshUserDetails = async () => {
    if (!token) return null;
    try {
      const fetched = await fetchUserDetails(user?.id);
      const merged = mergeUserProfiles(user, fetched);
      setUser(merged);
      persistUser(merged);
      return merged;
    } catch (error) {
      console.warn('Failed to refresh user details:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user && !!token, isLoading, login, sendOtp, refreshUserDetails, logout }}>
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
