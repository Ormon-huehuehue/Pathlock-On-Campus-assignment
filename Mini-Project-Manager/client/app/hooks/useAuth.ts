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
      let errorMessage = 'Login failed';

      try {
        const errorData = await response.json();

        // Handle different status codes with specific messages
        switch (response.status) {
          case 400:
            errorMessage = errorData.message || 'Invalid request. Please check your input.';
            break;
          case 401:
            errorMessage = errorData.message || 'Invalid username or password. Please try again.';
            break;
          case 403:
            errorMessage = errorData.message || 'Access forbidden. Your account may be suspended.';
            break;
          case 404:
            errorMessage = errorData.message || 'Login service not found. Please try again later.';
            break;
          case 429:
            errorMessage = errorData.message || 'Too many login attempts. Please wait before trying again.';
            break;
          case 500:
            errorMessage = errorData.message || 'Server error. Please try again later.';
            break;
          case 503:
            errorMessage = errorData.message || 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = errorData.message || `Login failed with status ${response.status}`;
        }
      } catch (parseError) {
        // If we can't parse the error response, use status-based messages
        switch (response.status) {
          case 401:
            errorMessage = 'Invalid username or password. Please try again.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Login failed (Status: ${response.status})`;
        }
      }

      throw new Error(errorMessage);
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
      let errorMessage = 'Registration failed';

      try {
        const errorData = await response.json();

        // Handle different status codes with specific messages
        switch (response.status) {
          case 400:
            errorMessage = errorData.message || 'Invalid registration data. Please check your input.';
            break;
          case 409:
            errorMessage = errorData.message || 'Username already exists. Please choose a different username.';
            break;
          case 422:
            errorMessage = errorData.message || 'Password does not meet requirements. Please check the password criteria.';
            break;
          case 429:
            errorMessage = errorData.message || 'Too many registration attempts. Please wait before trying again.';
            break;
          case 500:
            errorMessage = errorData.message || 'Server error. Please try again later.';
            break;
          case 503:
            errorMessage = errorData.message || 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = errorData.message || `Registration failed with status ${response.status}`;
        }
      } catch (parseError) {
        // If we can't parse the error response, use status-based messages
        switch (response.status) {
          case 400:
            errorMessage = 'Invalid registration data. Please check your input.';
            break;
          case 409:
            errorMessage = 'Username already exists. Please choose a different username.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Registration failed (Status: ${response.status})`;
        }
      }

      throw new Error(errorMessage);
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
      console.error('Login error:', err);

      // Set error for display in the form
      setError(errorMessage);

      // Also show error toast for better UX
      showError(
        "Login Failed",
        errorMessage
      );

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
      console.error('Registration error:', err);

      // Set error for display in the form
      setError(errorMessage);

      // Also show error toast for better UX
      showError(
        "Registration Failed",
        errorMessage
      );

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