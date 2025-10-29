"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side - Auth form */}
      <div className="w-full md:w-1/2 flex flex-col text-center justify-center px-4 sm:px-6 md:px-20 py-6 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-auto"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-gray-500 text-sm sm:text-base md:text-md mb-6 md:mb-8">
            {subtitle}
          </p>

          {children}
        </motion.div>
      </div>

      {/* Right side - Illustration */}
      <div className="w-full md:w-1/2 rounded-lg mx-4 my-4 md:m-10 border-2 bg-emerald-50 flex items-center justify-center p-4 md:p-8 order-first md:order-last">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg text-center"
        >
          <img
            src="/yogaImage.png"
            alt="Illustration"
            width={700}
            className="mx-auto mb-4 md:mb-6 max-w-full h-auto"
          />
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
            Manage your projects effortlessly
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            Boost productivity and stay organized
          </p>
        </motion.div>
      </div>
    </div>
  );
}