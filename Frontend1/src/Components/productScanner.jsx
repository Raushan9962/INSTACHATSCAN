import React, { useState, useRef, useEffect } from 'react';
import { Scan, Camera, Type } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { SCANNER_ERRORS, SCANNER_MESSAGES } from './scanner/constants'; // import only once
import { toast } from 'sonner';
import CameraView from './scanner/CameraView';
import ManualEntryForm from './scanner/ManualEntryForm';
import { checkCameraAvailability, startCameraStream, stopCameraStream } from './scanner/cameraUtils';

const ProductScanner = ({ onScanResult, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    setHasCamera(checkCameraAvailability());
  }, []);

  useEffect(() => {
    if (isOpen && isScanning && !manualEntry) {
      initializeCamera();
    }
    return () => cleanupCamera();
  }, [isOpen, isScanning, manualEntry]);

  const initializeCamera = async () => {
    setError('');
    const { stream, error } = await startCameraStream(videoRef);
    if (error) {
      setError(error);
      setManualEntry(true);
    } else {
      streamRef.current = stream;
    }
  };

  const cleanupCamera = () => {
    stopCameraStream(streamRef.current, videoRef);
    streamRef.current = null;
  };

  const handleScan = () => {
    setIsScanning(true);

    if (!hasCamera) {
      setManualEntry(true);
      return;
    }

    // Simulate scanning process
    setTimeout(() => {
      setManualEntry(true);
      toast.info(SCANNER_MESSAGES.CAMERA_READY);
    }, 2000);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanResult(manualCode.trim());
      handleClose();
      toast.success(SCANNER_MESSAGES.SCAN_SUCCESS);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsScanning(false);
    setManualEntry(false);
    setManualCode('');
    setError('');
    cleanupCamera();
  };

  const resetScanner = () => {
    setIsScanning(false);
    setManualEntry(false);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" onClick={() => setIsOpen(true)}>
            <Scan className="h-4 w-4 mr-2" />
            Scan Product
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Scan className="h-5 w-5" />
            <span>Scan Product Barcode</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isScanning ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {SCANNER_MESSAGES.SCAN_INSTRUCTIONS}
              </p>

              <div className="flex flex-col space-y-3">
                {hasCamera && (
                  <Button onClick={handleScan} className="flex items-center space-x-2">
                    <Camera className="h-4 w-4" />
                    <span>Start Camera Scan</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setManualEntry(true)}
                  className="flex items-center space-x-2"
                >
                  <Type className="h-4 w-4" />
                  <span>Enter Manually</span>
                </Button>
              </div>
            </div>
          ) : manualEntry ? (
            <ManualEntryForm
              code={manualCode}
              onChange={setManualCode}
              onSubmit={handleManualSubmit}
              onCancel={resetScanner}
            />
          ) : (
            <CameraView
              videoRef={videoRef}
              isActive={!error}
              onToggleManual={() => setManualEntry(true)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductScanner;
