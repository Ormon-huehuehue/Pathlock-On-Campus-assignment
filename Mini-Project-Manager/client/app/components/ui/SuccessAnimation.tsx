"use client";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface SuccessAnimationProps {
  message?: string;
  onComplete?: () => void;
}

export default function SuccessAnimation({ 
  message = "Success!", 
  onComplete 
}: SuccessAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        duration: 0.5 
      }}
      onAnimationComplete={onComplete}
      className="flex flex-col items-center justify-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 0.2, 
          type: "spring", 
          stiffness: 400, 
          damping: 15 
        }}
        className="mb-4"
      >
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 0.6,
            delay: 0.3,
            ease: "easeInOut"
          }}
        >
          <CheckCircle className="w-16 h-16 text-green-500" />
        </motion.div>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg font-medium text-gray-900 text-center"
      >
        {message}
      </motion.p>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="h-1 bg-green-500 rounded-full mt-4 max-w-xs"
      />
    </motion.div>
  );
}