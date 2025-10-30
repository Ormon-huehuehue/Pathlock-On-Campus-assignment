"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import AuthLayout from "@/app/components/auth/AuthLayout";
import LoginForm from "@/app/components/auth/LoginForm";
import RegisterForm from "@/app/components/auth/RegisterForm";
import PageTransition from "@/app/components/ui/PageTransition";
import GlobalLoader from "@/app/components/ui/GlobalLoader";
import { useAuth } from "@/app/hooks/useAuth";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<AuthMode>("register");
  const { isAuthenticated, isContextLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isContextLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isContextLoading, router]);

  // Show loading while checking authentication status
  if (isContextLoading) {
    return <GlobalLoader message="Preparing authentication..." />;
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  const handleSwitchToRegister = () => {
    setAuthMode("register");
  };

  const handleSwitchToLogin = () => {
    setAuthMode("login");
  };

  const getTitle = () => {
    return authMode === "login" ? "Welcome back" : "Create account";
  };

  const getSubtitle = () => {
    return authMode === "login" 
      ? "Sign in to your account to continue" 
      : "Join us and start managing your projects";
  };

  return (
    <PageTransition>
      <AuthLayout title={getTitle()} subtitle={getSubtitle()}>
        <AnimatePresence mode="wait">
          {authMode === "login" ? (
            <LoginForm 
              key="login"
              onSwitchToRegister={handleSwitchToRegister} 
            />
          ) : (
            <RegisterForm 
              key="register"
              onSwitchToLogin={handleSwitchToLogin} 
            />
          )}
        </AnimatePresence>
      </AuthLayout>
    </PageTransition>
  );
}