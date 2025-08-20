// src/Components/scanner/constants.js

export const SCANNER_ERRORS = {
  CAMERA_ACCESS_FAILED: 'Unable to access the camera',
  CAMERA_NOT_AVAILABLE: 'No camera found',
};

export const SCANNER_MESSAGES = {
  SCAN_INSTRUCTIONS: 'Point your camera at the barcode to scan.',
  CAMERA_READY: 'Camera is ready.',
  SCAN_SUCCESS: 'Scan successful!',
};

export const CAMERA_CONFIG = {
  video: {
    facingMode: 'environment', // back camera
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  audio: false,
};
