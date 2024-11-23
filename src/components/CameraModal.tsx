'use client';

import { Dialog } from '@headlessui/react';
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
import Webcam from 'react-webcam';
import { useCallback, useRef, useState } from 'react';
import { createWorker, createScheduler, Worker } from 'tesseract.js';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string, extractedText: ExtractedText) => void;
}

interface ExtractedText {
  name: string;
  email: string;
  phone: string;
  rawText: string;
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<ExtractedText>({
    name: '',
    email: '',
    phone: '',
    rawText: ''
  });

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setError('Failed to capture image. Please try again.');
      return;
    }
    await processImage(imageSrc);
  }, [webcamRef]);

  const processImage = async (imageData: string) => {
    try {
      setIsProcessing(true);
      const scheduler = createScheduler();
      const worker = await createWorker();
      
      // Initialize worker with English language
      await (worker as any).loadLanguage('eng');
      await (worker as any).initialize('eng');
      scheduler.addWorker(worker);

      const { data: { text } } = await scheduler.addJob('recognize', imageData);
      
      await scheduler.terminate();
      
      // Extract relevant information
      const lines = text.split('\n').filter(line => line.trim());
      const possibleName = lines[0]?.trim();
      const possibleEmail = lines.find(line => line.includes('@'))?.trim();
      const possiblePhone = lines.find(line => 
        line.match(/[\d-+()]{10,}/)
      )?.trim();

      const extracted = {
        name: possibleName || '',
        email: possibleEmail || '',
        phone: possiblePhone || '',
        rawText: text
      };
      
      setExtractedText(extracted);
      onCapture(imageData, extracted);
      onClose();
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white">
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div className="p-6">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Capture Business Card
              </Dialog.Title>

              <div className="relative aspect-[1.75] bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="absolute inset-0 w-full h-full object-cover"
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: 'environment'
                  }}
                />
                <div className="absolute inset-0 border-2 border-dashed border-gray-400 rounded-lg" />
              </div>

              {error && (
                <p className="text-sm text-red-600 mb-4">{error}</p>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={capture}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Capture'}
                </button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
