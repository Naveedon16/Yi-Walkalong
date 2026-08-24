import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Option {
  label: string;
  value: string;
}

export interface SearchableSelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  error,
  required,
  className
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(query.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full relative", className)} ref={wrapperRef}>
      {label && (
        <label className="text-sm font-medium text-[#1d1b20] ">
          {label} {required && <span className="text-[#b3261e] ">*</span>}
        </label>
      )}
      
      <div 
        className={cn(
          "flex items-center min-h-[48px] w-full rounded-xl border bg-white  px-4 py-2 text-sm transition-shadow cursor-pointer",
          isOpen ? "border-[#6750a4] ring-2 ring-[#6750a4]  " : "border-[#cac4d0] ",
          error ? "border-[#b3261e] ring-[#b3261e]  " : "",
        )}
        onClick={() => setIsOpen(true)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="flex-1 truncate text-[#1d1b20] ">
          {selectedOption ? selectedOption.label : <span className="text-[#49454f] ">Select an option</span>}
        </div>
        <ChevronDown className="h-5 w-5 text-[#49454f]  ml-2 shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white  rounded-xl shadow-lg border border-[#e1e2ec]  overflow-hidden">
          <div className="p-2 border-b border-[#e1e2ec]  flex items-center gap-2">
            <Search className="w-4 h-4 text-[#79747e] " />
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-sm text-[#1d1b20]  placeholder:text-gray-400"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button onClick={(e) => { e.stopPropagation(); setQuery(''); }}>
                <X className="w-4 h-4 text-[#79747e] " />
              </button>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-[#49454f]  text-center">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors",
                    option.value === value 
                      ? "bg-[#eaddff] text-[#21005d]   font-bold" 
                      : "hover:bg-[#f3edf7] text-[#1d1b20]  "
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setQuery('');
                  }}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {error && <span className="text-xs text-[#b3261e]  font-medium">{error}</span>}
    </div>
  );
}
