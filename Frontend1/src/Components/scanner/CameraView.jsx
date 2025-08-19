import React from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '../ui/button';

const CameraView = ({ videoRef, isActive, onToggleManual }) => {
  return (
    <div className="space-y-4">
      <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <CameraOff className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Position the barcode in the camera view
        </p>
        <Button variant="outline" onClick={onToggleManual} className="w-full">
          Enter Manually Instead
        </Button>
      </div>
    </div>
  );
};

export default CameraView;