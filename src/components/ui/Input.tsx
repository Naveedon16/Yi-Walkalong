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
          <label className="text-sm font-medium text-[#1d1b20] ">
            {label} {props.required && <span className="text-[#b3261e] ">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-xl border border-[#cac4d0]  bg-white  px-4 py-2 text-sm ring-offset-white  file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#49454f]  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6750a4]  disabled:cursor-not-allowed disabled:opacity-50 transition-shadow text-[#1d1b20] ",
            error && "border-[#b3261e]  focus-visible:ring-[#b3261e] ",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-[#b3261e]  font-medium">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
