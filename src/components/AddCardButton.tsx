'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, CameraIcon } from "@heroicons/react/24/outline";
import Input from "./ui/Input";
import CameraModal from "./CameraModal";
import { z } from "zod";

export default function AddCardButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    notes: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    title: z.string().optional(),
    company: z.string().optional(),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    phone: z.string().optional(),
    website: z.string().optional(),
    notes: z.string().optional(),
    category: z.string().optional(),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCapture = (imageData: string, extractedName?: string, cardInfo?: any) => {
    setShowCamera(false);
    setCardImage(imageData);
    
    // If we have extracted card info, populate all available fields
    if (cardInfo) {
      setFormData(prev => ({
        ...prev,
        name: cardInfo.name || prev.name,
        title: cardInfo.title || prev.title,
        company: cardInfo.company || prev.company,
        email: cardInfo.email || prev.email,
        phone: cardInfo.phone || prev.phone,
        website: cardInfo.website || prev.website,
        notes: cardInfo.notes || prev.notes
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Create form data with all fields
      const cardData = {
        ...formData,
        imageUrl: cardImage
      };

      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create card');
      }

      router.refresh();
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating card:', error);
      // Handle error (show message to user)
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      company: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      notes: "",
      category: "",
    });
    setCardImage(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
        Add Card
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Add New Card
                  </h3>
                  <div className="mt-4">
                    {error && (
                      <div className="mb-4 rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{error}</div>
                      </div>
                    )}

                    {/* Card Image */}
                    <div className="mb-6">
                      {cardImage ? (
                        <div className="relative">
                          <img
                            src={cardImage}
                            alt="Business Card"
                            className="w-full rounded-lg object-cover shadow-sm"
                          />
                          <button
                            onClick={() => setShowCamera(true)}
                            className="absolute bottom-2 right-2 rounded-full bg-white p-2 shadow-md hover:bg-gray-100"
                          >
                            <CameraIcon className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowCamera(true)}
                          className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <div>
                            <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <span className="mt-2 block text-sm font-semibold text-gray-900">
                              Take a photo of the card
                            </span>
                          </div>
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        type="text"
                        name="name"
                        label="Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        type="text"
                        name="title"
                        label="Title"
                        value={formData.title}
                        onChange={handleInputChange}
                      />
                      <Input
                        type="text"
                        name="company"
                        label="Company"
                        value={formData.company}
                        onChange={handleInputChange}
                      />
                      <Input
                        type="email"
                        name="email"
                        label="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      <Input
                        type="tel"
                        name="phone"
                        label="Phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                      <Input
                        type="url"
                        name="website"
                        label="Website"
                        value={formData.website}
                        onChange={handleInputChange}
                      />
                      <Input
                        type="text"
                        name="address"
                        label="Address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                      <Input
                        type="text"
                        name="category"
                        label="Category"
                        value={formData.category}
                        onChange={handleInputChange}
                      />
                      <Input
                        type="text"
                        name="notes"
                        label="Notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                      />

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Add Card
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={() => setIsOpen(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
