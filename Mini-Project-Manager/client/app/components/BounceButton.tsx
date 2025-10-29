import { Button, ButtonProps } from '@heroui/react'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface BounceButtonProps extends Omit<ButtonProps, 'children'> {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost";
  startContent?: ReactNode;
  endContent?: ReactNode;
  isDisabled?: boolean;
  isLoading?: boolean;
  onPress?: () => void;
}

export default function BounceButton({ 
  children,
  className = "",
  size = "lg",
  radius = "full",
  variant = "solid",
  startContent,
  endContent,
  isDisabled,
  isLoading,
  onPress,
  ...props 
}: BounceButtonProps) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        transition: { 
          type: "spring",
          stiffness: 400,
          damping: 15,
          mass: 1
        }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: {
          type: "spring",
          stiffness: 800,
          damping: 15,
          mass: 0.5,
          velocity: 1
        }
      }}
      animate={{ 
        scale: 1
      }}
      initial={{ scale: 1 }}
    >
      <Button
        className={`${className} relative`}
        size={size}
        radius={radius}
        variant={variant}
        startContent={startContent}
        endContent={endContent}
        isDisabled={isDisabled}
        isLoading={isLoading}
        onPress={onPress}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  )
} 
