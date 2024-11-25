'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { AddCardForm } from '@/components/AddCardForm';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface BusinessCard {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  imageUrl?: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddCard = async (data: Omit<BusinessCard, 'id'>) => {
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add card');
      }

      const newCard = await response.json();
      setCards((prev) => [...prev, newCard]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding card:', error);
      // TODO: Add proper error handling
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const filteredCards = cards.filter((card) =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Your Business Cards</h1>
            <Button onClick={() => setIsModalOpen(true)}>Add Card</Button>
          </div>

          <div className="max-w-md mt-6">
            <Input
              type="search"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {filteredCards.length === 0 ? (
            <Card className="mt-6">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-lg text-gray-600 mb-4">No business cards yet</p>
                <Button onClick={() => setIsModalOpen(true)}>Add your first card</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {filteredCards.map((card) => (
                <Card key={card.id} className="hover:shadow-lg transition-shadow">
                  {card.imageUrl && (
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={card.imageUrl}
                        alt={`${card.name}'s business card`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{card.name}</h3>
                        <p className="text-sm text-gray-600">{card.company}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center">
                        <span className="text-gray-600 mr-2">Email:</span>
                        <a href={`mailto:${card.email}`} className="text-blue-600 hover:underline">
                          {card.email}
                        </a>
                      </p>
                      <p className="flex items-center">
                        <span className="text-gray-600 mr-2">Phone:</span>
                        <a href={`tel:${card.phone}`} className="text-blue-600 hover:underline">
                          {card.phone}
                        </a>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Business Card"
      >
        <AddCardForm
          onSubmit={handleAddCard}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
