'use client';

import type { Card } from '@prisma/client';
import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from './ui/Input';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, BuildingOfficeIcon, PhoneIcon, GlobeAltIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { z } from 'zod';

type CardWithOwner = Card & {
  owner: {
    name: string | null;
    email: string;
  };
};

interface CardModalProps {
  card: CardWithOwner;
  onClose: () => void;
}

export default function CardModal({ card, onClose }: CardModalProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

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

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`/api/cards/${card.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: shareEmail }),
      });

      if (!res.ok) {
        throw new Error('Failed to share card');
      }

      setIsSharing(false);
      setShareEmail('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete card');
      }

      onClose();
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel 
          ref={modalRef}
          className="mx-auto max-w-lg w-full bg-white rounded-xl shadow-lg"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                View Business Card
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm">
                  {error}
                </div>
              )}

              {isSharing ? (
                <form onSubmit={handleShare} className="space-y-4">
                  <Input
                    type="email"
                    label="Email address"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    required
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsSharing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Share
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {card.name}
                    </h3>
                    {card.title && (
                      <p className="text-gray-600">{card.title}</p>
                    )}
                  </div>

                  {card.company && (
                    <div className="flex items-center text-gray-500">
                      <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                      {card.company}
                    </div>
                  )}

                  {card.phone && (
                    <div className="flex items-center text-gray-500">
                      <PhoneIcon className="h-5 w-5 mr-2" />
                      <a href={`tel:${card.phone}`} className="hover:text-blue-600">
                        {card.phone}
                      </a>
                    </div>
                  )}

                  {card.email && (
                    <div className="flex items-center text-gray-500">
                      <EnvelopeIcon className="h-5 w-5 mr-2" />
                      <a href={`mailto:${card.email}`} className="hover:text-blue-600">
                        {card.email}
                      </a>
                    </div>
                  )}

                  {card.website && (
                    <div className="flex items-center text-gray-500">
                      <GlobeAltIcon className="h-5 w-5 mr-2" />
                      <a 
                        href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        {card.website}
                      </a>
                    </div>
                  )}

                  {card.notes && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Notes
                      </h4>
                      <p className="text-gray-500 text-sm whitespace-pre-wrap">
                        {card.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setIsSharing(true)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Share
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
