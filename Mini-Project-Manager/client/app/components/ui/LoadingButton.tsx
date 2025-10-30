"use client";
import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface LoadingButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      isLoading = false,
      loadingText,
      variant = "primary",
      size = "md",
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const baseClasses = "relative inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed touch-manipulation";

    const variantClasses = {
      primary: "bg-darkBlue text-white disabled:bg-lightBlue disabled:text-darkBlue transition-all",
      secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-400",
      outline: "border-2 border-lightBlue text-white"
    };

    const sizeClasses = {
      sm: "px-3 py-2 sm:py-1.5 text-sm min-h-[44px] sm:min-h-auto",
      md: "px-4 py-3 sm:py-2 text-base min-h-[48px] sm:min-h-auto",
      lg: "px-6 py-4 sm:py-3 text-lg min-h-[52px] sm:min-h-auto"
    };

    const buttonClasses = `
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `;

    const spinnerSize = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6"
    };

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        className={buttonClasses}
        aria-busy={isLoading}
        aria-describedby={isLoading ? "loading-description" : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...(props as any)}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`}
          >
            <svg
              className={`${spinnerSize[size]} animate-spin`}
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </motion.div>
        )}

        {/* Button Content */}
        <span
          className={`flex items-center justify-center transition-opacity duration-200 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
        >
          {children}
        </span>

        {/* Screen Reader Loading Text */}
        {isLoading && (
          <span id="loading-description" className="sr-only">
            {loadingText || "Loading..."}
          </span>
        )}
      </motion.button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

export default LoadingButton;