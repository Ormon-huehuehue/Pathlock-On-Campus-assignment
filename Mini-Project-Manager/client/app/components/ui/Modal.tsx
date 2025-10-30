'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent scrolling on background
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') {
      // Trap focus within modal
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  };

  // Animation variants for backdrop - optimized for 60fps
  const backdropVariants = {
    hidden: { 
      opacity: 0
    },
    visible: { 
      opacity: 1
    },
    exit: { 
      opacity: 0
    }
  };

  // Animation variants for modal content - GPU-accelerated transforms only
  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.96,
      y: 12
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0
    },
    exit: { 
      opacity: 0,
      scale: 0.96,
      y: 12
    }
  };

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-lightBlue/40"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{
            duration: 0.15,
            ease: "easeOut"
          }}
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            willChange: 'opacity'
          }}
        >
          <motion.div
            ref={modalRef}
            className={`modal-content relative w-full max-w-md bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-300 ${className}`}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              duration: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              willChange: 'transform, opacity'
            }}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-300 bg-gradient-to-br from-lightBlue to-lightBlue/70 border-b-2">
                <h2 id="modal-title" className="text-2xl font-bold text-darkBlue tracking-tight">
                  {title}
                </h2>
                <motion.button
                  onClick={onClose}
                  className="p-2.5 bg-white border-2 border-gray-200 text-darkBlue/60 hover:text-darkBlue rounded-full hover:bg-lightBlue/50 transition-all"
                  aria-label="Close modal"
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    transition: { duration: 0.1, ease: "easeOut" }
                  }}
                  style={{
                    willChange: 'transform'
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </div>
            )}
            
            {/* Content */}
            <div className={`${title ? 'px-8 py-6' : 'p-8'}`}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Use portal to render modal at document body level
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}