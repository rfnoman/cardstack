'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Card {
  id: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  image?: string;
  notes?: string;
}

export default function CardList() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('/api/cards');
        if (!response.ok) {
          throw new Error('Failed to fetch cards');
        }
        const data = await response.json();
        console.log('Fetched cards:', data); // Debug log
        setCards(data);
      } catch (err) {
        console.error('Error fetching cards:', err);
        setError('Failed to load cards');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No business cards added yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
        >
          {card.image && (
            <div className="relative w-full h-48 bg-gray-50">
              <Image
                src={card.image}
                alt={`${card.name}'s business card`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain p-2"
                onError={(e) => {
                  console.error('Image failed to load:', card.image);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900">{card.name}</h3>
            {card.title && (
              <p className="text-sm text-gray-600 mt-1">{card.title}</p>
            )}
            {card.company && (
              <p className="text-sm text-gray-600">{card.company}</p>
            )}
            <div className="mt-4 space-y-2">
              {card.email && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {card.email}
                </p>
              )}
              {card.phone && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Phone:</span> {card.phone}
                </p>
              )}
              {card.website && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Website:</span> {card.website}
                </p>
              )}
              {card.address && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Address:</span> {card.address}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
