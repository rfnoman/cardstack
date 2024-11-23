'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { PlusIcon, CameraIcon } from '@heroicons/react/24/outline';
import Input from './ui/Input';
import CameraModal from './CameraModal';
import { z } from 'zod';

interface AddCardButtonProps {
  onCardAdded?: () => void;
}

interface ExtractedText {
  name: string;
  email: string;
  phone: string;
  rawText: string;
}

export default function AddCardButton({ onCardAdded }: AddCardButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    notes: ''
  });

  const handleCapture = (imageData: string, extractedText: ExtractedText) => {
    setCardImage(imageData);
    setFormData(prev => ({
      ...prev,
      name: extractedText.name || prev.name,
      email: extractedText.email || prev.email,
      phone: extractedText.phone || prev.phone,
      notes: extractedText.rawText || prev.notes
    }));
    setShowCamera(false);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      // Add image if exists
      if (cardImage) {
        // Convert base64 to blob
        const response = await fetch(cardImage);
        const blob = await response.blob();
        formDataToSend.append('image', blob, 'card.jpg');
      }

      const response = await fetch('/api/cards', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to create card');
      }

      router.refresh();
      setIsOpen(false);
      resetForm();
      onCardAdded?.();
    } catch (error) {
      console.error('Error creating card:', error);
      setError('Failed to create card. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      notes: ''
    });
    setCardImage(null);
    setError(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <PlusIcon className="h-5 w-5 mr-1" />
        Add Card
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-xl shadow-lg">
            <div className="p-6">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Add Business Card
              </Dialog.Title>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Card Image */}
                  {cardImage ? (
                    <div className="relative w-full aspect-[1.75] mb-4">
                      <img
                        src={cardImage}
                        alt="Business card preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="absolute bottom-2 right-2 bg-white/80 p-2 rounded-full hover:bg-white"
                      >
                        <CameraIcon className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="w-full aspect-[1.75] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400"
                    >
                      <div className="text-center">
                        <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <span className="mt-2 block text-sm font-medium text-gray-600">
                          Capture Business Card
                        </span>
                      </div>
                    </button>
                  )}

                  <Input
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  <Input
                    label="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />

                  <Input
                    label="Company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />

                  <Input
                    label="Phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />

                  <Input
                    label="Website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        resetForm();
                      }}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {showCamera && (
        <CameraModal
          isOpen={showCamera}
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
