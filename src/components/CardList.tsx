'use client';

import { Card } from "@prisma/client";
import { useState } from "react";
import CardModal from "./CardModal";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import Image from 'next/image';

type CardWithOwner = Card & {
  owner: {
    name: string | null;
    email: string;
  };
  imageUrl: string | null;
};

export default function CardList({ cards }: { cards: CardWithOwner[] }) {
  const [selectedCard, setSelectedCard] = useState<CardWithOwner | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => setSelectedCard(card)}
          className="relative group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
        >
          {/* Card container with fixed aspect ratio */}
          <div className="relative w-full aspect-[1.75] mb-3">
            {card.imageUrl ? (
              <Image
                src={card.imageUrl}
                alt={`${card.name}'s business card`}
                width={350}
                height={200}
                className="object-cover rounded-md w-full h-full"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={true}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = card.imageUrl || '';
                  img.onerror = null; // Prevent infinite loop
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gray-100 rounded-md flex items-center justify-center">
                <UserCircleIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {card.name}
            </h3>
            {card.title && (
              <p className="text-sm text-gray-600 truncate">{card.title}</p>
            )}
            {card.company && (
              <p className="text-sm text-gray-500 truncate">{card.company}</p>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-400 truncate">
            Added by {card.owner.name || card.owner.email}
          </div>
        </div>
      ))}

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
