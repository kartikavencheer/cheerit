import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('cheerit_token');
      const savedUser = localStorage.getItem('cheerit_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser) as UserProfile);
        } catch {
          localStorage.removeItem('cheerit_user');
        }
      }

      if (token) {
        try {
          const { data } = await apiClient.get<any>('/users/me');
          const profile = toUserProfile(data);
          setUser(profile);
          localStorage.setItem('cheerit_user', JSON.stringify(profile));
        } catch (error) {
          const status = axios.isAxiosError(error) ? error.response?.status : undefined;
          console.error('Auth check failed:', error);
          if (status === 401 || status === 403) {
            localStorage.removeItem('cheerit_token');
            localStorage.removeItem('cheerit_refresh_token');
            localStorage.removeItem('cheerit_user');
            setUser(null);
          }
        }
      }

      setIsLoading(false);
    };
    checkAuth();
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
      if (data.refreshToken) localStorage.setItem('cheerit_refresh_token', data.refreshToken);

      const nextUser = toUserProfile(data.user);
      setUser(nextUser);
      localStorage.setItem('cheerit_user', JSON.stringify(nextUser));

      try {
        const { data: me } = await apiClient.get<any>('/users/me');
        const fullProfile = toUserProfile(me);
        setUser(fullProfile);
        localStorage.setItem('cheerit_user', JSON.stringify(fullProfile));
      } catch {
        // Non-fatal: keep the user from verify response
      }
      toast.success(data.message || 'Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      const message = error instanceof Error ? error.message : 'Invalid OTP or login failed.';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('cheerit_token');
    localStorage.removeItem('cheerit_refresh_token');
    localStorage.removeItem('cheerit_user');
    setUser(null);
    toast.info('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, sendOtp, logout }}>
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
