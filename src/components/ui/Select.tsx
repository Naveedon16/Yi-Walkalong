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
          <label className="flex items-center text-sm font-medium text-[#1d1b20] ">
            <span className="flex-1">{label} {props.required && <span className="text-[#b3261e] ">*</span>}</span>
            {labelAction && <span className="ml-2">{labelAction}</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "flex h-12 w-full appearance-none rounded-xl border border-[#cac4d0]  bg-white  px-4 py-2 pr-10 text-sm ring-offset-white  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6750a4]  disabled:cursor-not-allowed disabled:opacity-50 transition-shadow text-[#1d1b20] ",
              error && "border-[#b3261e]  focus-visible:ring-[#b3261e] ",
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
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#49454f]  pointer-events-none" />
        </div>
        {error && <span className="text-xs text-[#b3261e]  font-medium">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
