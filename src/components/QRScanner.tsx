import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from './ui/Button';

interface CameraDevice {
  id: string;
  label: string;
}

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScanSuccess, onScanError, onClose }: QRScannerProps) {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);
  
  const getCameraLabel = (label: string, index: number) => {
    const lower = label.toLowerCase();
    if (lower.includes('back') || lower.includes('rear') || lower.includes('environment')) {
      return `Rear Camera (${label || index + 1})`;
    } else if (lower.includes('front') || lower.includes('user') || lower.includes('face')) {
      return `Front Camera (${label || index + 1})`;
    }
    return label || `Camera ${index + 1}`;
  };

  const loadCameras = async (activeCameraId?: string) => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({ id: device.deviceId, label: device.label }));
        
      setCameras(videoDevices);
      
      if (activeCameraId && videoDevices.find(d => d.id === activeCameraId)) {
        setSelectedCameraId(activeCameraId);
      } else if (videoDevices.length > 0 && !selectedCameraId) {
        const backCameras = videoDevices.filter(d => {
          const lbl = d.label.toLowerCase();
          return lbl.includes('back') || lbl.includes('rear') || lbl.includes('environment');
        });
        if (backCameras.length > 0) {
          setSelectedCameraId(backCameras[0].id);
        } else {
          setSelectedCameraId(videoDevices[0].id);
        }
      }
    } catch (err) {
      console.error("Error enumerating devices", err);
    }
  };

  const startScanning = useCallback(async (cameraIdOrConfig: any) => {
    if (isStartingRef.current) return;
    
    try {
      isStartingRef.current = true;
      
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("custom-reader");
      }
      
      const qrCode = html5QrCodeRef.current;
      
      if (qrCode.isScanning) {
        await qrCode.stop();
      }

      await qrCode.start(
        cameraIdOrConfig,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          if (onScanError) onScanError(errorMessage);
        }
      );
      
      if (typeof cameraIdOrConfig === 'string') {
        loadCameras(cameraIdOrConfig);
      } else {
        loadCameras();
      }
      
    } catch (err: any) {
      console.error("Error starting scanner", err);
      setCameraError(err.message || "Failed to start camera.");
    } finally {
      isStartingRef.current = false;
    }
  }, [onScanSuccess, onScanError]);

  useEffect(() => {
    let mounted = true;
    
    const initCamera = async () => {
      if (!mounted) return;
      try {
        const savedCameraId = sessionStorage.getItem('selectedCameraId');
        if (savedCameraId) {
          await startScanning(savedCameraId);
        } else {
          await startScanning({ facingMode: { ideal: "environment" } });
        }
      } catch (err: any) {
        if (mounted) {
          setCameraError("Camera permission denied or camera not accessible.");
        }
      }
    };
    
    const timer = setTimeout(initCamera, 100);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().then(() => {
            html5QrCodeRef.current?.clear();
          }).catch(console.error);
        } else {
          try { html5QrCodeRef.current.clear(); } catch(e) {}
        }
      }
    };
  }, [startScanning]);

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    sessionStorage.setItem('selectedCameraId', newId);
    startScanning(newId);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {cameraError ? (
        <div className="text-red-600 text-sm mb-4">{cameraError}</div>
      ) : (
        <>
          {cameras.length > 1 && (
            <div className="mb-4 w-full max-w-sm">
              <label className="block text-sm font-medium text-[#49454f] dark:text-gray-300 mb-1 text-left">
                Select Camera
              </label>
              <select 
                value={selectedCameraId} 
                onChange={handleCameraChange}
                className="w-full rounded-md border border-[#cac4d0] dark:border-gray-700 bg-white dark:bg-[#1e1e1e] px-3 py-2 text-sm text-[#1d1b20] dark:text-white"
              >
                {cameras.map((c, i) => (
                  <option key={c.id} value={c.id}>
                    {getCameraLabel(c.label, i)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div id="custom-reader" className="w-full max-w-sm bg-black dark:bg-[#1e1e1e] rounded-lg overflow-hidden mb-4 border border-[#e1e2ec] dark:border-gray-700 min-h-[250px]"></div>
        </>
      )}
      <Button type="button" variant="outline" onClick={onClose} aria-label="Close QR scanner">
        Cancel Scanner
      </Button>
    </div>
  );
}
