import Link from 'next/link';
import { callApi } from '@/lib/api-client';
import { ItemsList } from '@/components/items/items-list';
import type { Item } from '@/types/item';

async function getItems(): Promise<Item[]> {
  const res = await callApi('/items', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function ItemsPage() {
  const items = await getItems();

  return (
    <div className="min-h-screen bg-muted">
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-1 block">← Back</Link>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Items</h1>
          </div>
          <Link
            href="/items/new"
            className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
          >
            New item
          </Link>
        </div>
        <ItemsList items={items} />
      </main>
    </div>
  );
}
