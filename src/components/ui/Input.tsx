import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-[#1d1b20] dark:text-gray-100">
            {label} {props.required && <span className="text-[#b3261e] dark:text-red-400">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-xl border border-[#cac4d0] dark:border-gray-700 bg-white dark:bg-[#1e1e1e] px-4 py-2 text-sm ring-offset-white dark:ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#49454f] dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6750a4] dark:focus-visible:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow text-[#1d1b20] dark:text-white",
            error && "border-[#b3261e] dark:border-red-500 focus-visible:ring-[#b3261e] dark:focus-visible:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-[#b3261e] dark:text-red-400 font-medium">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
