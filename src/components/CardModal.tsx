'use client';

import type { Card } from "@prisma/client";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "./ui/Input";
import { Dialog } from '@headlessui/react';
import { XMarkIcon, BuildingOfficeIcon, PhoneIcon, GlobeAltIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { z } from "zod";

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
  const [shareEmail, setShareEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: shareEmail }),
      });

      if (!res.ok) {
        throw new Error("Failed to share card");
      }

      setIsSharing(false);
      setShareEmail("");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete card");
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
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-xl shadow-lg">
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <Dialog.Title className="text-2xl font-semibold text-gray-900">
                    {card.name}
                  </Dialog.Title>
                  {card.title && (
                    <p className="mt-1 text-gray-600">{card.title}</p>
                  )}
                </div>
              </div>

              {/* Card Image */}
              {card.imageUrl && (
                <div className="relative w-full aspect-[1.75] mb-4">
                  <img
                    src={card.imageUrl}
                    alt={`${card.name}'s business card`}
                    className="w-full h-full object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = card.imageUrl || '';
                      img.onerror = null;
                    }}
                  />
                </div>
              )}

              <div className="mt-6 space-y-4">
                {card.company && (
                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{card.company}</span>
                  </div>
                )}
                {card.email && (
                  <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <a
                      href={`mailto:${card.email}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {card.email}
                    </a>
                  </div>
                )}
                {card.phone && (
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <a
                      href={`tel:${card.phone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {card.phone}
                    </a>
                  </div>
                )}
                {card.website && (
                  <div className="flex items-center space-x-2">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                    <a
                      href={card.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {card.website}
                    </a>
                  </div>
                )}
                {card.notes && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{card.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
