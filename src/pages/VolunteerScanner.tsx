import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AdminService } from '../services';
import { QrCode, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { QRScanner } from "../components/QRScanner";
import { motion, AnimatePresence } from 'motion/react';

export function VolunteerScanner() {
  const [manualId, setManualId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'duplicate' | 'invalid' | 'error', details?: any, message?: string } | null>(null);
  
  const scannerRef = useRef<any>(null);

  // To avoid double scanning the same QR repeatedly
  const lastScannedIdRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const processRegistration = async (id: string) => {
    setIsProcessing(true);
    setScanResult(null);
    try {
      const response = await AdminService.checkInParticipant(id);
      setScanResult({ type: 'success', details: response.participant });
    } catch (err: any) {
      if (err.message === 'ALREADY_CHECKED_IN') {
        setScanResult({ type: 'duplicate', message: 'This participant is already checked in.' });
      } else if (err.message === 'Registration not found') {
        setScanResult({ type: 'invalid', message: 'Registration not found.' });
      } else {
        setScanResult({ type: 'error', message: err.message || 'An error occurred during check-in.' });
      }
    } finally {
      setIsProcessing(false);
      setManualId('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    processRegistration(manualId.trim());
  };

  const handleScanSuccess = (decodedText: string) => {
    const scannedId = decodedText.trim();
    const now = Date.now();
    
    if (scannedId === lastScannedIdRef.current && (now - lastScannedTimeRef.current < 5000)) {
      return;
    }
    
    lastScannedIdRef.current = scannedId;
    lastScannedTimeRef.current = now;
    
    setShowScanner(false);
    processRegistration(scannedId);
  };

  const startScanner = () => {
    setScanResult(null);
    setCameraError('');
    setShowScanner(true);
    lastScannedIdRef.current = '';
    lastScannedTimeRef.current = 0;
  };

  const stopScanner = () => {
    setShowScanner(false);
  };

  return (
    <div className="max-w-xl mx-auto w-full pt-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1d1b20]  mb-2">Check-In Scanner</h1>
        <p className="text-[#49454f] ">Scan participant QR codes or enter Registration ID manually.</p>
      </div>

      <Card className="mb-6 border-[#cac4d0] ">
        {!showScanner ? (
          <div className="flex flex-col items-center py-6">
            <Button onClick={startScanner} size="lg" className="w-full sm:w-64 gap-2 mb-8 bg-[#6750a4]">
              <QrCode className="w-5 h-5" />
              Start Scanner
            </Button>
            
            <div className="w-full relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#cac4d0] "></div>
              </div>
              <div className="relative bg-white  px-4 text-sm text-[#79747e]  font-medium">OR</div>
            </div>

            <form onSubmit={handleManualSubmit} className="w-full">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input 
                  placeholder="Enter Registration ID" 
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isProcessing} className="w-full sm:w-auto">
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check In'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h3 className="font-medium text-[#1d1b20]  mb-4">Point camera at QR code</h3>
            <QRScanner 
              onScanSuccess={handleScanSuccess} 
              onClose={stopScanner} 
            />
          </div>
        )}
      </Card>

      <AnimatePresence mode="wait">
        {scanResult && (
          <motion.div
            key={scanResult.type + Date.now()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {scanResult.type === 'success' && (
              <Card className="border-t-4 border-t-green-600 bg-green-50 ">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100  flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600 " />
                  </div>
                  <h3 className="text-xl font-bold text-green-800  mb-2">
                    {scanResult.details?.name === 'Pending Sync' ? 'CHECK-IN QUEUED' : 'CHECK-IN CONFIRMED'}
                  </h3>
                  {scanResult.details?.name === 'Pending Sync' && (
                    <p className="text-sm text-green-700  mb-4 font-medium px-4">
                      You are offline. This scan has been saved locally and will sync when your connection returns.
                    </p>
                  )}
                  <div className="mb-6"></div>
                  
                  <div className="w-full bg-white  rounded-xl p-4 mb-6 shadow-sm border border-green-100 ">
                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div>
                        <p className="text-xs text-[#79747e]  uppercase font-bold tracking-wider mb-1">Name</p>
                        <p className="font-medium text-[#1d1b20] ">{scanResult.details?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#79747e]  uppercase font-bold tracking-wider mb-1">Registration ID</p>
                        <p className="font-medium text-[#1d1b20] ">{scanResult.details?.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#79747e]  uppercase font-bold tracking-wider mb-1">Category</p>
                        <p className="font-medium text-[#1d1b20] ">{scanResult.details?.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#79747e]  uppercase font-bold tracking-wider mb-1">T-Shirt Size</p>
                        <p className="font-medium text-[#1d1b20] ">{scanResult.details?.tshirtSize}</p>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => { setScanResult(null); startScanner(); }} variant="outline" className="w-full">Scan Next</Button>
                </div>
              </Card>
            )}

            {scanResult.type === 'duplicate' && (
              <Card className="border-t-4 border-t-amber-500 bg-amber-50 ">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100  flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-amber-600 " />
                  </div>
                  <h3 className="text-xl font-bold text-amber-800  mb-2">ALREADY CHECKED IN</h3>
                  <p className="text-amber-700  mb-6">{scanResult.message}</p>
                  <Button onClick={() => { setScanResult(null); startScanner(); }} variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-100">Scan Next</Button>
                </div>
              </Card>
            )}

            {(scanResult.type === 'invalid' || scanResult.type === 'error') && (
              <Card className="border-t-4 border-t-red-600 bg-red-50 ">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-red-100  flex items-center justify-center mb-4">
                    <XCircle className="w-8 h-8 text-red-600 " />
                  </div>
                  <h3 className="text-xl font-bold text-red-800  mb-2">
                    {scanResult.type === 'invalid' ? 'REGISTRATION NOT FOUND' : 'ERROR'}
                  </h3>
                  <p className="text-red-700  mb-6">{scanResult.message}</p>
                  <Button onClick={() => { setScanResult(null); startScanner(); }} variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-100">Scan Next</Button>
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
