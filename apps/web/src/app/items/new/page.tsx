'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ItemForm } from '@/components/items/item-form';
import { bffFetch } from '@/lib/bff-fetch';

export default function NewItemPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: { title: string; description?: string }) {
    setIsLoading(true);
    try {
      const res = await bffFetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error('Failed to create item');
      router.push('/items');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">New Item</h1>
      <ItemForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Create" />
    </main>
  );
}
