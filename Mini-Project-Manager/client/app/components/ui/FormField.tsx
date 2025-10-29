"use client";
import { useState, forwardRef } from "react";
import { motion } from "framer-motion";

interface FormFieldProps {
  id: string;
  label: string;
  type?: "text" | "password" | "email";
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      id,
      label,
      type = "text",
      value,
      onChange,
      onBlur,
      error,
      placeholder,
      required = false,
      disabled = false,
      className = "",
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const hasValue = value.length > 0;
    const shouldFloatLabel = isFocused || hasValue;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const inputType = type === "password" && showPassword ? "text" : type;

    return (
      <div className={`relative ${className}`}>
        <motion.div
          className="relative"
          animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <input
            ref={ref}
            id={id}
            type={inputType}
            value={value}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            placeholder={shouldFloatLabel ? placeholder : ""}
            required={required}
            disabled={disabled}
            className={`
              w-full px-4 py-3 sm:py-4 border rounded-md transition-all duration-200 outline-none text-base
              text-gray-900 placeholder-gray-400
              ${error
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              }
              ${disabled ? "bg-gray-50 cursor-not-allowed text-gray-500" : "bg-white"}
              ${shouldFloatLabel ? "pt-6 sm:pt-7 pb-2" : "py-3 sm:py-4"}
              touch-manipulation
            `}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${id}-error` : undefined}
          />

          {/* Floating Label */}
          <motion.label
            htmlFor={id}
            className={`
              absolute left-4 pointer-events-none transition-all duration-200
              ${shouldFloatLabel
                ? "top-2 sm:top-2.5 text-xs sm:text-xs text-gray-500"
                : "top-1/2 -translate-y-1/2 text-base text-gray-400"
              }
              ${error && shouldFloatLabel ? "text-red-500" : ""}
              ${isFocused && !error ? "text-emerald-600" : ""}
            `}
            animate={{
              y: shouldFloatLabel ? 0 : 0,
              scale: shouldFloatLabel ? 0.85 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </motion.label>

          {/* Password Toggle Button */}
          {type === "password" && (
            <motion.button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md touch-manipulation"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {showPassword ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </motion.button>
          )}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            id={`${id}-error`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-1 text-sm text-red-600 flex items-center"
            role="alert"
          >
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.div>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;