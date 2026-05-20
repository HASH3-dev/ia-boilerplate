'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ItemForm } from '@/components/items/item-form';
import { bffFetch } from '@/lib/bff-fetch';
import type { Item } from '@/types/item';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    bffFetch(`/api/items/${id}`)
      .then((r) => r.json())
      .then(setItem);
  }, [id]);

  async function handleUpdate(values: { title?: string; description?: string }) {
    setIsLoading(true);
    try {
      const res = await bffFetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to update item');
      router.push('/items');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this item?')) return;
    setIsLoading(true);
    try {
      await bffFetch(`/api/items/${id}`, { method: 'DELETE' });
      router.push('/items');
    } finally {
      setIsLoading(false);
    }
  }

  if (!item) return <p className="p-6">Loading...</p>;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Item</h1>
      <ItemForm
        defaultValues={{ title: item.title, description: item.description ?? undefined }}
        onSubmit={handleUpdate}
        isLoading={isLoading}
        submitLabel="Update"
      />
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="mt-4 text-destructive text-sm underline disabled:opacity-50"
      >
        Delete item
      </button>
    </main>
  );
}
