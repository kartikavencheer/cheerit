import React, { createContext, useContext, useState, useEffect } from 'react';
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
      if (token) {
        try {
          const { data } = await apiClient.get<UserProfile>('/user/profile');
          setUser(data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('cheerit_token');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const sendOtp = async (phone: string) => {
    try {
      await apiClient.post('/auth/send-otp', { phone });
      toast.success('OTP sent successfully!');
    } catch (error) {
      console.error('Failed to send OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
      throw error;
    }
  };

  const login = async (phone: string, otp: string) => {
    try {
      const { data } = await apiClient.post<{ token: string; user: UserProfile }>('/auth/verify-otp', { phone, otp });
      localStorage.setItem('cheerit_token', data.token);
      setUser(data.user);
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Invalid OTP or login failed.');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('cheerit_token');
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
