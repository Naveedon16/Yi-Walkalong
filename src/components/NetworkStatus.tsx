import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null; // Only show when offline to be non-intrusive

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700   rounded-full text-xs font-medium border border-red-200 " title="You are offline. Submissions will be synced when connection is restored.">
      <WifiOff className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Offline Mode</span>
    </div>
  );
}
