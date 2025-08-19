
import { SCANNER_ERRORS, CAMERA_CONFIG } from './constants';


export const checkCameraAvailability = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

export const startCameraStream = async (videoRef) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONFIG);
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    
    return { stream, error: null };
  } catch (err) {
    console.error('Camera access failed:', err);
    return { stream: null, error: SCANNER_ERRORS.CAMERA_ACCESS_FAILED };
  }
};

export const stopCameraStream = (stream, videoRef) => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
};