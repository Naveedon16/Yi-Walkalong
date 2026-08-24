import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { AlertOctagon } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f3edf7]  flex items-center justify-center p-4">
          <Card className="max-w-xl w-full text-center">
            <div className="w-16 h-16 bg-red-100  text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-[#1d1b20]  mb-4">Something went wrong</h1>
            <div className="bg-[#f8f9ff]  p-4 rounded-xl border border-[#e1e2ec]  text-left mb-6 overflow-auto max-h-48 text-sm font-mono text-red-600 ">
              {this.state.error?.message || 'Unknown error'}
            </div>
            <Button onClick={() => window.location.href = '/'}>
              Return to Home
            </Button>
          </Card>
        </div>
      );
    }

    return (this as any).props.children;
  }
}