import React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none tracking-wide";
  
  const variants = {
    primary: "bg-[#6750a4] text-white hover:bg-[#523f85] focus:ring-[#6750a4] shadow-sm   ",
    secondary: "bg-[#eaddff] text-[#21005d] hover:bg-[#d0bcff] focus:ring-[#6750a4]    ",
    outline: "border border-[#79747e] text-[#6750a4] hover:bg-[#6750a4]/5 focus:ring-[#6750a4]    ",
    ghost: "text-[#6750a4] hover:bg-[#6750a4]/5 focus:ring-[#6750a4]   "
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-10 px-6 text-sm",
    lg: "h-12 px-8 text-base"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
