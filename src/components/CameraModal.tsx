'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { createWorker, createScheduler } from 'tesseract.js';
import Webcam from 'react-webcam';
import { Dialog } from '@headlessui/react';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string, extractedName?: string, cardInfo?: any) => void;
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractCardInfo = (text: string) => {
    // Split text into lines and remove empty ones
    const lines = text.split('\n').filter(line => line.trim());
    
    const cardInfo = {
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      notes: ''
    };

    // Regular expressions for different fields
    const patterns = {
      email: /\b[\w\.-]+@[\w\.-]+\.\w+\b/i,
      phone: /(?:\+?\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/,
      website: /\b(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+\b/i
    };

    // Find name (2-3 words without special characters)
    const nameLines = lines.filter(line => {
      const words = line.trim().split(/\s+/);
      return words.length >= 2 && words.length <= 3 && 
             words.every(word => word.length > 1) &&
             !/[@\d\(\)]/.test(line);
    });
    if (nameLines.length > 0) {
      cardInfo.name = nameLines[0].trim();
    }

    // Find title (usually after name, one line)
    if (nameLines.length > 0) {
      const nameIndex = lines.indexOf(nameLines[0]);
      if (nameIndex + 1 < lines.length) {
        const possibleTitle = lines[nameIndex + 1];
        if (!patterns.email.test(possibleTitle) && 
            !patterns.phone.test(possibleTitle) && 
            !patterns.website.test(possibleTitle)) {
          cardInfo.title = possibleTitle.trim();
        }
      }
    }

    // Find company (usually the largest text or after title)
    const companyLines = lines.filter(line => {
      return !patterns.email.test(line) && 
             !patterns.phone.test(line) && 
             !patterns.website.test(line) &&
             line !== cardInfo.name &&
             line !== cardInfo.title;
    });
    if (companyLines.length > 0) {
      cardInfo.company = companyLines[0].trim();
    }

    // Find email
    const emailMatch = text.match(patterns.email);
    if (emailMatch) {
      cardInfo.email = emailMatch[0].toLowerCase();
    }

    // Find phone number
    const phoneMatch = text.match(patterns.phone);
    if (phoneMatch) {
      cardInfo.phone = phoneMatch[0];
    }

    // Find website
    const websiteMatch = text.match(patterns.website);
    if (websiteMatch) {
      cardInfo.website = websiteMatch[0].toLowerCase();
    }

    // Remaining text goes to notes
    const usedLines = new Set([
      cardInfo.name,
      cardInfo.title,
      cardInfo.company,
      cardInfo.email,
      cardInfo.phone,
      cardInfo.website
    ]);
    
    const remainingLines = lines
      .filter(line => !Array.from(usedLines).some(used => line.includes(used)))
      .filter(line => line.trim().length > 0);
    
    if (remainingLines.length > 0) {
      cardInfo.notes = remainingLines.join('\n');
    }

    return cardInfo;
  };

  const initializeWorker = async () => {
    const scheduler = createScheduler();
    const worker = await createWorker({
      logger: m => console.debug(m)
    });
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    scheduler.addWorker(worker);
    return { worker, scheduler };
  };

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      try {
        setIsProcessing(true);

        // Process image first
        const processedImage = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Standard business card ratio is 1.75 (3.5:2)
            const CARD_RATIO = 1.75;
            const TARGET_WIDTH = 1280; // Max width
            const TARGET_HEIGHT = TARGET_WIDTH / CARD_RATIO;
            
            canvas.width = TARGET_WIDTH;
            canvas.height = TARGET_HEIGHT;
            
            if (ctx) {
              // Fill with white background
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Calculate dimensions to maintain aspect ratio
              const imgRatio = img.width / img.height;
              let drawWidth = TARGET_WIDTH;
              let drawHeight = TARGET_HEIGHT;
              let offsetX = 0;
              let offsetY = 0;
              
              if (imgRatio > CARD_RATIO) {
                drawWidth = TARGET_HEIGHT * imgRatio;
                offsetX = -(drawWidth - TARGET_WIDTH) / 2;
              } else {
                drawHeight = TARGET_WIDTH / imgRatio;
                offsetY = -(drawHeight - TARGET_HEIGHT) / 2;
              }
              
              // Draw image centered
              ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
              resolve(canvas.toDataURL('image/jpeg', 0.9));
            } else {
              reject(new Error('Failed to get canvas context'));
            }
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imageSrc;
        });

        // Store processed image
        setCapturedImage(processedImage);

        // Run OCR on the processed image
        try {
          const { worker, scheduler } = await initializeWorker();

          // Convert base64 to binary for Tesseract
          const base64Data = processedImage.split(',')[1];
          const binaryData = atob(base64Data);
          const array = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            array[i] = binaryData.charCodeAt(i);
          }
          const imageBlob = new Blob([array], { type: 'image/jpeg' });
          
          const { data: { text } } = await worker.recognize(imageBlob);
          
          // Extract card information
          const cardInfo = extractCardInfo(text);
          
          await scheduler.terminate();
          onCapture(processedImage, cardInfo.name, cardInfo);
        } catch (error) {
          console.error('OCR Error:', error);
          onCapture(processedImage);
        }

        setIsProcessing(false);
        onClose();
      } catch (error) {
        console.error('Image processing error:', error);
        setIsProcessing(false);
      }
    }
  }, [webcamRef, onCapture, onClose]);

  useEffect(() => {
    // Cleanup URLs when component unmounts
    return () => {
      if (capturedImage && capturedImage.startsWith('blob:')) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, [capturedImage]);

  const retake = () => {
    setCapturedImage(null);
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment"
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              {isProcessing ? 'Processing...' : 'Capture Business Card'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="relative">
            {!capturedImage ? (
              <>
                <div className="relative w-full" style={{ aspectRatio: '1.75' }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Business card frame overlay */}
                  <div className="absolute inset-4 border-2 border-dashed border-white opacity-50 rounded-lg flex items-center justify-center">
                    <div className="text-white text-sm text-center opacity-75">
                      Align business card within frame
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="relative w-full" style={{ aspectRatio: '1.75' }}>
                <img
                  src={capturedImage}
                  alt="Captured business card"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-center space-x-4">
            {!capturedImage ? (
              <button
                onClick={capture}
                disabled={isProcessing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <CameraIcon className="h-5 w-5 mr-2" />
                Capture
              </button>
            ) : (
              <button
                onClick={retake}
                disabled={isProcessing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Retake
              </button>
            )}
          </div>

          {isProcessing && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Processing image and extracting text...
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
