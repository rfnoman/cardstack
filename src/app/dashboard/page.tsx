'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { AddCardForm } from '@/components/AddCardForm';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';

interface BusinessCard {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/cards');
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleAddCard = async (data: {
    fullName: string;
    company: string;
    email: string;
    phone: string;
    image: string | null;
  }) => {
    try {
      console.log('Submitting card with image:', !!data.image);
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.fullName,
          company: data.company,
          email: data.email,
          phone: data.phone,
          image: data.image,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add card');
      }

      fetchCards();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/cards?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      fetchCards();
    } catch (error) {
      console.error('Error deleting card:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const filteredCards = cards.filter((card) =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="w-full max-w-md">
          <Input
            type="search"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Add Card</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading cards...</p>
        </div>
      ) : cards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">No business cards yet</h3>
              <p className="text-sm text-gray-500">
                Start by adding your first business card
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                Add your first card
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <Card key={card.id} className="overflow-hidden flex flex-col group">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCard(card.id)}
                  disabled={isDeleting}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
              {card.imageUrl ? (
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={card.imageUrl}
                    alt={`${card.name}'s business card`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-50 flex items-center justify-center">
                  <div className="text-gray-400 text-center p-4">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <span className="mt-2 block text-sm">No image</span>
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle>
                  <h3 className="text-lg font-semibold">{card.name}</h3>
                  {card.company && (
                    <p className="text-sm text-gray-500">{card.company}</p>
                  )}
                </CardTitle>
                <div className="space-y-1 text-sm">
                  {card.email && (
                    <p>
                      <a
                        href={`mailto:${card.email}`}
                        className="text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{card.email}</span>
                      </a>
                    </p>
                  )}
                  {card.phone && (
                    <p>
                      <a
                        href={`tel:${card.phone}`}
                        className="text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>{card.phone}</span>
                      </a>
                    </p>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Business Card"
      >
        <AddCardForm onSubmit={handleAddCard} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
