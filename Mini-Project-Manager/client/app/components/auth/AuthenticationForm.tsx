"use client";
import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import AuthLayout from "./AuthLayout";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type FormMode = "login" | "register";

interface FormDataCache {
  login: {
    username: string;
    password: string;
  };
  register: {
    username: string;
    password: string;
    confirmPassword: string;
  };
}

export default function AuthenticationForm() {
  const [formMode, setFormMode] = useState<FormMode>("login");
  
  // Cache form data to preserve during quick switches
  const [formDataCache, setFormDataCache] = useState<FormDataCache>({
    login: { username: "", password: "" },
    register: { username: "", password: "", confirmPassword: "" }
  });

  const switchToLogin = useCallback(() => {
    setFormMode("login");
  }, []);

  const switchToRegister = useCallback(() => {
    setFormMode("register");
  }, []);

  const getTitle = () => {
    return formMode === "login" ? "Welcome Back!" : "Welcome!";
  };

  const getSubtitle = () => {
    return formMode === "login" 
      ? "Sign in to access your dashboard" 
      : "Join us and simplify your workflow";
  };

  return (
    <AuthLayout title={getTitle()} subtitle={getSubtitle()}>
      <AnimatePresence mode="wait">
        {formMode === "login" ? (
          <LoginForm 
            key="login"
            onSwitchToRegister={switchToRegister}
          />
        ) : (
          <RegisterForm 
            key="register"
            onSwitchToLogin={switchToLogin}
          />
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}