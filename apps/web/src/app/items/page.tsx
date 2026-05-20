import Link from 'next/link';
import { ItemsList } from '@/components/items/items-list';
import type { Item } from '@/types/item';

async function getItems(): Promise<Item[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/items`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function ItemsPage() {
  const items = await getItems();

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Items</h1>
        <Link
          href="/items/new"
          className="bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium"
        >
          New item
        </Link>
      </div>
      <ItemsList items={items} />
    </main>
  );
}
