'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ItemForm } from '@/components/items/item-form';
import { bffFetch } from '@/lib/bff-fetch';

export default function NewItemPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: { title: string; description?: string }) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await bffFetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error('Failed to create item');
      router.push('/items');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted">
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/items" className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-1 block">← Back to items</Link>
          <h1 className="text-2xl font-black tracking-tight text-foreground">New Item</h1>
        </div>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        <div className="card-elevated rounded-xl border bg-card p-6 shadow-sm">
          <ItemForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Create" />
        </div>
      </main>
    </div>
  );
}
