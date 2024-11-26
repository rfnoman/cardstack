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
  image?: string | null;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    setCardToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!cardToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/cards?id=${cardToDelete}`, {
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
      setShowDeleteModal(false);
      setCardToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCardToDelete(null);
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
            <Card key={card.id} className="overflow-hidden flex flex-col group relative">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCard(card.id)}
                  disabled={isDeleting}
                  className="hover:bg-red-600 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
              {card.image ? (
                <div className="relative bg-gray-100">
                  <img
                    src={card.image}
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-2">No image</p>
                  </div>
                </div>
              )}
              <CardContent className="flex-1 p-4">
                <h3 className="font-semibold text-lg">{card.name}</h3>
                {card.company && (
                  <p className="text-gray-600">{card.company}</p>
                )}
                {card.email && (
                  <p className="text-gray-600 text-sm">{card.email}</p>
                )}
                {card.phone && (
                  <p className="text-gray-600 text-sm">{card.phone}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Business Card"
      >
        <AddCardForm
          onSubmit={handleAddCard}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        title="Delete Card"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this card? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </div>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
