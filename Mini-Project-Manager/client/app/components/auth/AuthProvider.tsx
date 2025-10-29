'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User } from '@/app/types/auth';
import { storage } from '@/app/utils/storage';

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'INITIALIZE'; payload: { token: string | null } };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'INITIALIZE':
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = () => {
      const token = storage.getToken();
      dispatch({ type: 'INITIALIZE', payload: { token } });
    };

    initializeAuth();
  }, []);

  const login = (token: string, user: User) => {
    storage.setToken(token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
  };

  const logout = () => {
    storage.removeToken();
    dispatch({ type: 'LOGOUT' });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    setLoading,
    setError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};