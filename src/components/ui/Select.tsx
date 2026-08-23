import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
  labelAction?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, labelAction, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="flex items-center text-sm font-medium text-[#1d1b20] dark:text-gray-100">
            <span className="flex-1">{label} {props.required && <span className="text-[#b3261e] dark:text-red-400">*</span>}</span>
            {labelAction && <span className="ml-2">{labelAction}</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "flex h-12 w-full appearance-none rounded-xl border border-[#cac4d0] dark:border-gray-700 bg-white dark:bg-[#1e1e1e] px-4 py-2 pr-10 text-sm ring-offset-white dark:ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6750a4] dark:focus-visible:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow text-[#1d1b20] dark:text-white",
              error && "border-[#b3261e] dark:border-red-500 focus-visible:ring-[#b3261e] dark:focus-visible:ring-red-500",
              className
            )}
            {...props}
          >
            <option value="" disabled hidden>Select an option</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#49454f] dark:text-gray-300 pointer-events-none" />
        </div>
        {error && <span className="text-xs text-[#b3261e] dark:text-red-400 font-medium">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
