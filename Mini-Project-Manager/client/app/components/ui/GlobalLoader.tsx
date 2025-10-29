"use client";
import { motion } from "framer-motion";

interface GlobalLoaderProps {
  message?: string;
}

export default function GlobalLoader({ message = "Loading..." }: GlobalLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-emerald-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
        className="flex flex-col items-center"
      >
        {/* Animated Logo/Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full"></div>
        </motion.div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 text-lg font-medium"
        >
          {message}
        </motion.p>

        {/* Animated Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex space-x-1 mt-4"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -8, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
              className="w-2 h-2 bg-emerald-500 rounded-full"
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}