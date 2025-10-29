"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export interface ToastProps {
  id: string;
  type: "success" | "error" | "warning";
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
};

const toastStyles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
};

const iconStyles = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
};

export default function Toast({ id, type, title, message, duration = 4000, onClose }: ToastProps) {
  const Icon = toastIcons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.4 
      }}
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${toastStyles[type]}
        max-w-sm w-full
      `}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
      >
        <Icon className={`w-5 h-5 ${iconStyles[type]} flex-shrink-0 mt-0.5`} />
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <motion.h4 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="font-medium text-sm"
        >
          {title}
        </motion.h4>
        {message && (
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm opacity-90 mt-1"
          >
            {message}
          </motion.p>
        )}
      </div>

      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 }}
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4 opacity-60" />
      </motion.button>

      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg origin-left"
      />
    </motion.div>
  );
}