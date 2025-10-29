"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import FormField from "@/app/components/ui/FormField";
import LoadingButton from "@/app/components/ui/LoadingButton";
import ErrorMessage from "@/app/components/ui/ErrorMessage";
import PasswordStrengthIndicator from "@/app/components/ui/PasswordStrengthIndicator";
import { useAuth } from "@/app/hooks/useAuth";
import { validateField, validatePassword, validatePasswordConfirmation } from "@/app/utils/validation";
import { RegisterFormData } from "@/app/types/auth";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    password: "",
    confirmPassword: "",
  });
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(""));

  // Clear errors when switching forms or when form data changes
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Update password validation when password changes
  useEffect(() => {
    setPasswordValidation(validatePassword(formData.password));
  }, [formData.password]);

  const handleFieldChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Real-time validation for touched fields
    if (touched[field]) {
      let validation;
      if (field === "confirmPassword") {
        validation = validatePasswordConfirmation(formData.password, value);
      } else {
        validation = validateField(field, value);
      }
      
      if (!validation.isValid) {
        setFieldErrors(prev => ({ 
          ...prev, 
          [field]: validation.errors[0] 
        }));
      }
    }
  };

  const handleFieldBlur = (field: keyof RegisterFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let validation;
    if (field === "confirmPassword") {
      validation = validatePasswordConfirmation(formData.password, formData[field]);
    } else {
      validation = validateField(field, formData[field]);
    }
    
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
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = "Password does not meet requirements";
      isValid = false;
    }

    // Validate password confirmation
    const confirmPasswordValidation = validatePasswordConfirmation(
      formData.password, 
      formData.confirmPassword
    );
    if (!confirmPasswordValidation.isValid) {
      errors.confirmPassword = confirmPasswordValidation.errors[0];
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

    const result = await register(formData);
    
    if (result.success) {
      // Success handling is done in the useAuth hook (redirect, etc.)
      console.log("Registration successful");
    }
    // Error handling is managed by the useAuth hook
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
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

        <div>
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
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <PasswordStrengthIndicator 
              validation={passwordValidation}
              showRequirements={true}
            />
          )}
        </div>

        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(value) => handleFieldChange("confirmPassword", value)}
          onBlur={() => handleFieldBlur("confirmPassword")}
          error={fieldErrors.confirmPassword}
          required
          disabled={isLoading}
        />

        <LoadingButton
          type="submit"
          isLoading={isLoading}
          loadingText="Creating account..."
          className="w-full"
          disabled={isLoading}
        >
          Create Account
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
        Already have an account?{" "}
        <motion.button
          type="button"
          onClick={onSwitchToLogin}
          className="text-emerald-600 font-medium hover:underline focus:outline-none focus:underline touch-manipulation py-1 px-1"
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          Sign in
        </motion.button>
      </p>
    </motion.div>
  );
}