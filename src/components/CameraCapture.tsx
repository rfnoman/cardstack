import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { CameraIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.label);
        track.stop();
      });
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      streamRef.current = null;
      setIsActive(false);
    }
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log('Requesting camera access...');
      
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false
      };

      console.log('Requesting camera access with constraints:', constraints);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted:', mediaStream.getVideoTracks()[0].getSettings());

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        streamRef.current = mediaStream;
        
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('Video playback started');
                setIsActive(true);
                setIsLoading(false);
              })
              .catch((err) => {
                console.error('Error starting video playback:', err);
                throw err;
              });
          }
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Unable to access camera. Please ensure you have granted camera permissions.'
      );
      setIsLoading(false);
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx && videoRef.current) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        console.log('Image captured, length:', imageData.length);
        onCapture(imageData);
        stopCamera();
      }
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Failed to capture photo. Please try again.');
    }
  };

  useEffect(() => {
    console.log('Component mounted, starting camera');
    startCamera();
    return () => {
      console.log('Component unmounting, stopping camera');
      stopCamera();
    };
  }, []); // Empty dependency array since we're using refs

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setError('');
              startCamera();
            }}
          >
            Try Again
          </Button>
        </div>
      )}
      
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isActive ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary" />
            
            <div className="absolute inset-8 border-2 border-dashed border-primary/50">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-primary/70 text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                  Align card within frame
                </span>
              </div>
            </div>
          </div>
        )}

        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-2 text-center">
              <CameraIcon className="h-12 w-12 text-gray-400 mx-auto animate-pulse" />
              <p className="text-sm text-gray-500">
                {error ? 'Camera access denied' : isLoading ? 'Initializing camera...' : 'Camera not active'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        {isActive && !isLoading && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                stopCamera();
                startCamera();
              }}
              className="flex items-center space-x-2"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span>Reset</span>
            </Button>
            <Button
              type="button"
              onClick={capturePhoto}
              className="flex items-center space-x-2"
            >
              <CameraIcon className="h-5 w-5" />
              <span>Capture</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
