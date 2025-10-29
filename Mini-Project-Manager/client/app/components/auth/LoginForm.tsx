"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import FormField from "@/app/components/ui/FormField";
import LoadingButton from "@/app/components/ui/LoadingButton";
import ErrorMessage from "@/app/components/ui/ErrorMessage";
import { useAuth } from "@/app/hooks/useAuth";
import { validateField } from "@/app/utils/validation";
import { LoginFormData } from "@/app/types/auth";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Clear errors when switching forms or when form data changes
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleFieldChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Real-time validation for touched fields
    if (touched[field]) {
      const validation = validateField(field, value);
      if (!validation.isValid) {
        setFieldErrors(prev => ({ 
          ...prev, 
          [field]: validation.errors[0] 
        }));
      }
    }
  };

  const handleFieldBlur = (field: keyof LoginFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const validation = validateField(field, formData[field]);
    if (!validation.isValid) {
      setFieldErrors(prev => ({ 
        ...prev, 
        [field]: validation.errors[0] 
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Validate username
    const usernameValidation = validateField("username", formData.username);
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.errors[0];
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData);
    
    if (result.success) {
      // Success handling is done in the useAuth hook (redirect, etc.)
      console.log("Login successful");
    }
    // Error handling is managed by the useAuth hook
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4">
        {/* API Error Display */}
        {error && (
          <ErrorMessage 
            message={error} 
            type="api" 
            className="mb-4"
          />
        )}

        <FormField
          id="username"
          label="Username"
          type="text"
          value={formData.username}
          onChange={(value) => handleFieldChange("username", value)}
          onBlur={() => handleFieldBlur("username")}
          error={fieldErrors.username}
          required
          disabled={isLoading}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={(value) => handleFieldChange("password", value)}
          onBlur={() => handleFieldBlur("password")}
          error={fieldErrors.password}
          required
          disabled={isLoading}
        />

        <LoadingButton
          type="submit"
          isLoading={isLoading}
          loadingText="Signing in..."
          className="w-full"
          disabled={isLoading}
        >
          Sign In
        </LoadingButton>
      </form>

      <div className="flex items-center my-5 sm:my-6">
        <div className="flex-grow border-t border-gray-300" />
        <span className="mx-3 text-sm sm:text-sm text-gray-500 whitespace-nowrap">or continue with</span>
        <div className="flex-grow border-t border-gray-300" />
      </div>

      <div className="flex justify-center gap-3 sm:gap-4">
        <motion.button 
          type="button"
          className="p-3 sm:p-2 border rounded-full hover:bg-gray-50 transition-colors touch-manipulation min-w-[48px] min-h-[48px] sm:min-w-auto sm:min-h-auto flex items-center justify-center"
          disabled={isLoading}
          aria-label="Continue with Google"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <FaGoogle size={18} />
        </motion.button>
        <motion.button 
          type="button"
          className="p-3 sm:p-2 border rounded-full hover:bg-gray-50 transition-colors touch-manipulation min-w-[48px] min-h-[48px] sm:min-w-auto sm:min-h-auto flex items-center justify-center"
          disabled={isLoading}
          aria-label="Continue with Apple"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <FaApple size={18} />
        </motion.button>
        <motion.button 
          type="button"
          className="p-3 sm:p-2 border rounded-full hover:bg-gray-50 transition-colors touch-manipulation min-w-[48px] min-h-[48px] sm:min-w-auto sm:min-h-auto flex items-center justify-center"
          disabled={isLoading}
          aria-label="Continue with Facebook"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <FaFacebook size={18} />
        </motion.button>
      </div>

      <p className="text-sm sm:text-sm text-gray-600 text-center mt-6 sm:mt-8">
        Don't have an account?{" "}
        <motion.button
          type="button"
          onClick={onSwitchToRegister}
          className="text-emerald-600 font-medium hover:underline focus:outline-none focus:underline touch-manipulation py-1 px-1"
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          Sign up
        </motion.button>
      </p>

      {/* Password Requirements Helper Text */}
      <div className="mt-4 p-3 sm:p-3 bg-gray-50 rounded-md">
        <p className="text-xs sm:text-xs text-gray-600 mb-2 font-medium">Password Requirements:</p>
        <ul className="text-xs sm:text-xs text-gray-500 space-y-1">
          <li>• At least 8 characters long</li>
          <li>• Contains uppercase and lowercase letters</li>
          <li>• Contains at least one number</li>
          <li>• Contains at least one special character</li>
        </ul>
      </div>
    </motion.div>
  );
}