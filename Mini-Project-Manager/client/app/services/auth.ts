import api from './api';
import { storage } from '../utils/storage';
import { 
  LoginFormData, 
  RegisterFormData, 
  LoginResponse, 
  RegisterResponse, 
  ApiError 
} from '../types/auth';

export class AuthService {
  /**
   * Login user with username and password
   */
  static async login(credentials: LoginFormData): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/api/auth/login', credentials);
      
      // Store token on successful login
      if (response.data.token) {
        storage.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      // Handle and transform API errors
      if (error.response?.data) {
        const apiError: ApiError = error.response.data;
        throw new Error(apiError.message || 'Login failed');
      }
      
      // Handle network errors
      if (error.request) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      
      // Handle other errors
      throw new Error(error.message || 'An unexpected error occurred during login');
    }
  }

  /**
   * Register new user account
   */
  static async register(userData: RegisterFormData): Promise<RegisterResponse> {
    try {
      // Remove confirmPassword from the request payload
      const { confirmPassword, ...registrationData } = userData;
      
      const response = await api.post<RegisterResponse>('/api/auth/register', registrationData);
      
      // Store token on successful registration
      if (response.data.token) {
        storage.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      // Handle validation errors with field mapping
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessage = this.formatValidationErrors(validationErrors);
        throw new Error(errorMessage);
      }
      
      // Handle other API errors
      if (error.response?.data) {
        const apiError: ApiError = error.response.data;
        throw new Error(apiError.message || 'Registration failed');
      }
      
      // Handle network errors
      if (error.request) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      
      // Handle other errors
      throw new Error(error.message || 'An unexpected error occurred during registration');
    }
  }

  /**
   * Logout user and cleanup tokens
   */
  static async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await api.post('/api/auth/logout');
    } catch (error) {
      // Continue with cleanup even if API call fails
      console.warn('Logout API call failed, but continuing with local cleanup');
    } finally {
      // Always cleanup local storage
      storage.removeToken();
    }
  }

  /**
   * Verify current token validity
   */
  static async verifyToken(): Promise<boolean> {
    try {
      const token = storage.getToken();
      if (!token) {
        return false;
      }

      // Make a request to verify token validity
      await api.get('/api/auth/verify');
      return true;
    } catch (error) {
      // Token is invalid, remove it
      storage.removeToken();
      return false;
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<any> {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expired or invalid
        storage.removeToken();
        throw new Error('Session expired. Please log in again.');
      }
      
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Format validation errors for display
   */
  private static formatValidationErrors(errors: Record<string, string[]>): string {
    const errorMessages: string[] = [];
    
    Object.entries(errors).forEach(([field, messages]) => {
      if (messages && messages.length > 0) {
        errorMessages.push(`${field}: ${messages.join(', ')}`);
      }
    });
    
    return errorMessages.length > 0 
      ? errorMessages.join('; ') 
      : 'Validation failed';
  }
}

export default AuthService;