'use client';

import { useState } from 'react';
import { useAuthContext } from '@/app/components/auth/AuthProvider';
import { useToast } from '@/app/components/ui/ToastProvider';
import { LoginFormData, RegisterFormData, ApiError } from '@/app/types/auth';

// API service functions (will be implemented in task 3)
const authAPI = {
  login: async (data: LoginFormData) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5152';
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    return response.json();
  },

  register: async (data: RegisterFormData) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5152';
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: data.username,
        password: data.password,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    return response.json();
  },
};

export const useAuth = () => {
  const context = useAuthContext();
  const { showSuccess, showError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginUser = async (formData: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authAPI.login(formData);
      context.login(response.token, response.user);
      
      // Show success toast
      showSuccess(
        "Welcome back!",
        `Successfully logged in as ${response.user.username}`
      );
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (formData: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authAPI.register(formData);
      context.login(response.token, response.user);
      
      // Show success toast
      showSuccess(
        "Account created successfully!",
        `Welcome to the platform, ${response.user.username}!`
      );
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = () => {
    context.logout();
    setError(null);
    
    // Show success toast
    showSuccess(
      "Logged out successfully",
      "See you next time!"
    );
  };

  const clearError = () => {
    setError(null);
  };

  return {
    // Auth state from context
    user: context.user,
    token: context.token,
    isAuthenticated: context.isAuthenticated,
    isContextLoading: context.isLoading,
    
    // Hook-specific loading state for operations
    isLoading,
    error,
    
    // Auth operations
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    clearError,
  };
};