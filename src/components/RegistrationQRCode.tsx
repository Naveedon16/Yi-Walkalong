import React, { Component, ReactNode, ErrorInfo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface RegistrationQRCodeProps {
  registrationId: string;
  size?: number;
}

interface State {
  hasError: boolean;
}

class QRErrorBoundary extends Component<{children: ReactNode, fallback: ReactNode}, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in QR Code:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // @ts-ignore
      return this.props.fallback;
    }
    // @ts-ignore
    return this.props.children;
  }
}

export function RegistrationQRCode({ registrationId, size = 150 }: RegistrationQRCodeProps) {
  if (!registrationId) {
    return (
      <div className="flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg mx-auto" style={{ width: size, height: size }}>
        <span className="text-sm font-medium">QR code unavailable</span>
      </div>
    );
  }

  const fallbackUI = (
    <div className="flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg mx-auto" style={{ width: size, height: size }}>
      <span className="text-sm font-medium">QR code unavailable</span>
    </div>
  );

  return (
    <QRErrorBoundary fallback={fallbackUI}>
      <div 
        className="bg-white  p-3 rounded-xl shadow-sm mx-auto flex items-center justify-center" 
        style={{ width: size + 24, height: size + 24 }}
        aria-label={`QR code for registration ${registrationId}`}
        title={`QR code for registration ${registrationId}`}
      >
        <QRCodeCanvas 
          value={registrationId}
          size={size}
          level="M"
          includeMargin={true}
          className="w-full h-auto"
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        />
      </div>
    </QRErrorBoundary>
  );
}
