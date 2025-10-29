export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AuthFormState {
  mode: 'login' | 'register';
  formData: LoginFormData | RegisterFormData;
  errors: Record<string, string>;
  isLoading: boolean;
}