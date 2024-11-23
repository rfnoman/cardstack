'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from './register-sw';
import CardList from '@/components/CardList';
import AddCardButton from '@/components/AddCardButton';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/api/auth/signin');
    },
  });

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
          My Business Cards
        </h1>
        <AddCardButton />
      </div>
      <CardList />
    </main>
  );
}
