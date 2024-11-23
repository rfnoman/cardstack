'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker } from './register-sw';
import CardList from '@/components/CardList';
import AddCardButton from '@/components/AddCardButton';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import type { Card } from '@prisma/client';

type CardWithOwner = Card & {
  owner: {
    name: string | null;
    email: string;
  };
};

export default function Home() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/api/auth/signin');
    },
  });

  const [cards, setCards] = useState<CardWithOwner[]>([]);

  useEffect(() => {
    registerServiceWorker();
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/cards');
      if (response.ok) {
        const data = await response.json();
        setCards(data);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
          My Business Cards
        </h1>
        <AddCardButton onCardAdded={fetchCards} />
      </div>
      <CardList cards={cards} />
    </main>
  );
}
