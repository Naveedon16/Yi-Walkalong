import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[32px] bg-white dark:bg-[#1e1e1e] shadow-sm border border-[#e1e2ec] p-6 sm:p-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}
