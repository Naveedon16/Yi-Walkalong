import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-[#6750a4] " role="status" aria-live="polite">
      <Loader2 className="w-8 h-8 animate-spin mb-4" aria-hidden="true" />
      <p className="font-medium">{message}</p>
    </div>
  );
}
