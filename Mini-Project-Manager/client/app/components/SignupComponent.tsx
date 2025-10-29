"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";

export default function SignupComponent() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side - Signup form */}
      <div className="w-full md:w-1/2 flex flex-col text-center justify-center px-10 md:px-20 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-6xl font-bold text-gray-900 mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-500 text-md mb-8">
            Join us and simplify your workflow.
          </p>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white rounded-md py-2 font-medium hover:bg-emerald-700 transition"
            >
              Sign Up
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300" />
            <span className="mx-3 text-sm text-gray-500">or continue with</span>
            <div className="flex-grow border-t border-gray-300" />
          </div>

          <div className="flex justify-center gap-4">
            <button className="p-2 border rounded-full hover:bg-gray-50">
              <FaGoogle size={18} />
            </button>
            <button className="p-2 border rounded-full hover:bg-gray-50">
              <FaApple size={18} />
            </button>
            <button className="p-2 border rounded-full hover:bg-gray-50">
              <FaFacebook size={18} />
            </button>
          </div>

          <p className="text-sm text-gray-600 text-center mt-8">
            Already have an account?{" "}
            <a href="#" className="text-emerald-600 font-medium hover:underline">
              Login
            </a>
          </p>
        </motion.div>
      </div>

      {/* Right side - Illustration */}
      <div className="w-full md:w-1/2 rounded-lg m-10 border-2 bg-emerald-50 flex items-center justify-center p-8">
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
            className="mx-auto mb-6"
          />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Manage your projects effortlessly
          </h2>
          <p className="text-gray-600 text-sm">
            Boost productivity and stay organized
          </p>
        </motion.div>
      </div>
    </div>
  );
}
