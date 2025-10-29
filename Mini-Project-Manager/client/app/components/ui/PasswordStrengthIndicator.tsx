'use client';

import React from 'react';
import { PasswordValidationResult } from '@/app/utils/validation';

interface PasswordStrengthIndicatorProps {
  validation: PasswordValidationResult;
  showRequirements?: boolean;
}

export function PasswordStrengthIndicator({ 
  validation, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) {
  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'weak':
      default:
        return 'bg-red-500';
    }
  };

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'Strong';
      case 'medium':
        return 'Medium';
      case 'weak':
      default:
        return 'Weak';
    }
  };

  const getStrengthWidth = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'w-full';
      case 'medium':
        return 'w-2/3';
      case 'weak':
      default:
        return 'w-1/3';
    }
  };

  return (
    <div className="mt-2 sm:mt-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2 sm:h-2">
          <div
            className={`h-2 sm:h-2 rounded-full transition-all duration-300 ${getStrengthColor(
              validation.strength
            )} ${getStrengthWidth(validation.strength)}`}
          />
        </div>
        <span
          className={`text-sm sm:text-sm font-medium whitespace-nowrap ${
            validation.strength === 'strong'
              ? 'text-green-600'
              : validation.strength === 'medium'
              ? 'text-yellow-600'
              : 'text-red-600'
          }`}
        >
          {getStrengthText(validation.strength)}
        </span>
      </div>

      {/* Requirements List */}
      {showRequirements && validation.requirements.length > 0 && (
        <div className="space-y-1 sm:space-y-1">
          {validation.requirements.map((requirement) => (
            <div
              key={requirement.id}
              className={`flex items-start gap-2 text-sm sm:text-sm transition-colors duration-200 ${
                requirement.met ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <div
                className={`w-4 h-4 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0 mt-0.5 sm:mt-0 ${
                  requirement.met
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {requirement.met ? (
                  <svg
                    className="w-3 h-3 sm:w-3 sm:h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3 h-3 sm:w-3 sm:h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2a1 1 0 002 0V7zm-1 4a1 1 0 100 2 1 1 0 000-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className={`${requirement.met ? 'line-through' : ''} leading-relaxed`}>
                {requirement.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Success Message */}
      {validation.isValid && (
        <div className="flex items-start gap-2 mt-2 text-green-600 text-sm sm:text-sm font-medium">
          <div className="w-5 h-5 sm:w-5 sm:h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
            <svg
              className="w-3 h-3 sm:w-3 sm:h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="leading-relaxed">Password meets all requirements!</span>
        </div>
      )}
    </div>
  );
}

export default PasswordStrengthIndicator;