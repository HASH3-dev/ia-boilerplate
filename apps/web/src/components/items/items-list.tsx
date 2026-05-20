import Link from 'next/link';
import type { Item } from '@/types/item';

interface ItemsListProps {
  items: Item[];
}

export function ItemsList({ items }: ItemsListProps) {
  if (items.length === 0) {
    return <p className="text-muted-foreground">No items yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="border rounded p-4">
          <Link href={`/items/${item.id}`} className="font-medium hover:underline">
            {item.title}
          </Link>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
