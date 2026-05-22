'use client';

import Link from 'next/link';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bffFetch(`/api/items/${id}`)
      .then((r) => r.json())
      .then(setItem)
      .catch(() => setError('Failed to load item'));
  }, [id]);

  async function handleUpdate(values: { title?: string; description?: string }) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await bffFetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to update item');
      router.push('/items');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this item?')) return;
    setIsLoading(true);
    setError(null);
    try {
      await bffFetch(`/api/items/${id}`, { method: 'DELETE' });
      router.push('/items');
    } catch {
      setError('Failed to delete item');
    } finally {
      setIsLoading(false);
    }
  }

  if (error && !item) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/items" className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-1 block">← Back to items</Link>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Edit Item</h1>
        </div>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        <div className="card-elevated rounded-xl border bg-card p-6 shadow-sm">
          <ItemForm
            defaultValues={{ title: item.title, description: item.description ?? undefined }}
            onSubmit={handleUpdate}
            isLoading={isLoading}
            submitLabel="Update"
          />
        </div>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="mt-4 text-xs text-destructive hover:underline disabled:opacity-50 transition-opacity"
        >
          Delete this item
        </button>
      </main>
    </div>
  );
}
