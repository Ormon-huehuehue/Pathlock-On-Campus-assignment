"use client";
import { motion, AnimatePresence } from "framer-motion";

interface ErrorMessageProps {
  message?: string;
  messages?: string[];
  type?: "field" | "form" | "api";
  className?: string;
  id?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  messages,
  type = "field",
  className = "",
  id,
}) => {
  // Don't render if no error message(s)
  if (!message && (!messages || messages.length === 0)) {
    return null;
  }

  const errorMessages = messages || (message ? [message] : []);

  const getIcon = () => {
    switch (type) {
      case "form":
      case "api":
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case "field":
      default:
        return (
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getContainerClasses = () => {
    const baseClasses = "text-red-600 flex items-start";
    
    switch (type) {
      case "form":
      case "api":
        return `${baseClasses} p-4 bg-red-50 border border-red-200 rounded-md ${className}`;
      case "field":
      default:
        return `${baseClasses} text-sm mt-1 ${className}`;
    }
  };

  const getTextClasses = () => {
    switch (type) {
      case "form":
      case "api":
        return "ml-3 text-sm font-medium";
      case "field":
      default:
        return "ml-1";
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={errorMessages.join(",")}
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.2 }}
        className={getContainerClasses()}
        role="alert"
        aria-live="polite"
        id={id}
      >
        {getIcon()}
        <div className={getTextClasses()}>
          {errorMessages.length === 1 ? (
            <span>{errorMessages[0]}</span>
          ) : (
            <div>
              {type === "form" || type === "api" ? (
                <div className="mb-2 font-medium">
                  {type === "api" ? "Server Error:" : "Please fix the following errors:"}
                </div>
              ) : null}
              <ul className={`${errorMessages.length > 1 ? "list-disc list-inside space-y-1" : ""}`}>
                {errorMessages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorMessage;