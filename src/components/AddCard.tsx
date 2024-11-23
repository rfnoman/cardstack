'use client';

import { useState } from 'react';
import Input from './ui/Input';

interface AddCardProps {
  onSubmit: (data: { name: string; title: string; company: string; email: string; phone: string }) => Promise<void>;
  variant?: 'light' | 'dark';
}

export default function AddCard({ onSubmit, variant = 'light' }: AddCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      title: formData.get('title') as string,
      company: formData.get('company') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    };

    try {
      await onSubmit(data);
      e.currentTarget.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add card');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className={`rounded-md ${variant === 'dark' ? 'bg-red-900/50' : 'bg-red-50'} p-4`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${variant === 'dark' ? 'text-red-200' : 'text-red-800'}`}>
                {error}
              </h3>
            </div>
          </div>
        </div>
      )}

      <Input
        name="name"
        type="text"
        label="Full Name"
        required
        variant={variant}
        icon={
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
          </svg>
        }
      />

      <Input
        name="title"
        type="text"
        label="Job Title"
        required
        variant={variant}
        icon={
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        }
      />

      <Input
        name="company"
        type="text"
        label="Company"
        required
        variant={variant}
        icon={
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
        }
      />

      <Input
        name="email"
        type="email"
        label="Email Address"
        required
        variant={variant}
        icon={
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        }
      />

      <Input
        name="phone"
        type="tel"
        label="Phone Number"
        required
        variant={variant}
        icon={
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        }
      />

      <div>
        <button
          type="submit"
          disabled={loading}
          className={`flex w-full justify-center rounded-md px-3 py-2.5 text-sm font-semibold leading-6 shadow-sm 
            ${variant === 'dark' 
              ? 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600' 
              : 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600'
            } 
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Adding...' : 'Add Card'}
        </button>
      </div>
    </form>
  );
}
