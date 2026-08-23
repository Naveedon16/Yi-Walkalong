import React from 'react';
import { AlertCircle, WifiOff, Clock, ServerCrash, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title: string;
  message: string;
  code?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, code, onRetry }: ErrorStateProps) {
  let Icon = AlertCircle;
  let iconClass = 'text-red-600 dark:text-red-400';
  let bgClass = 'bg-red-50 dark:bg-red-900/20';
  
  if (code === 'CONFIGURATION_ERROR') {
    Icon = ServerCrash;
    iconClass = 'text-purple-600 dark:text-purple-400';
    bgClass = 'bg-purple-50 dark:bg-purple-900/20';
  } else if (code === 'NETWORK_ERROR') {
    Icon = WifiOff;
    iconClass = 'text-amber-600 dark:text-amber-400';
    bgClass = 'bg-amber-50 dark:bg-amber-900/20';
  } else if (code === 'TIMEOUT_ERROR') {
    Icon = Clock;
    iconClass = 'text-orange-600 dark:text-orange-400';
    bgClass = 'bg-orange-50 dark:bg-orange-900/20';
  } else if (code === 'SERVER_ERROR') {
    Icon = ServerCrash;
  }

  return (
    <div className="max-w-2xl mx-auto w-full p-8 text-center bg-white dark:bg-[#1e1e1e] rounded-2xl border border-[#cac4d0] dark:border-gray-700 shadow-sm" role="alert" aria-live="assertive">
      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${bgClass}`}>
        <Icon className={`w-8 h-8 ${iconClass}`} aria-hidden="true" />
      </div>
      <h2 className="text-xl font-bold mb-2 text-[#1d1b20] dark:text-white">
        {title}
      </h2>
      <p className="text-[#49454f] dark:text-gray-300 mb-6 max-w-md mx-auto">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="min-w-[120px]">
          <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" /> Try again
        </Button>
      )}
    </div>
  );
}
