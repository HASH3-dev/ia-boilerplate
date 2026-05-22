import Link from 'next/link';
import type { Item } from '@/types/item';

interface ItemsListProps {
  items: Item[];
}

export function ItemsList({ items }: ItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/40 py-16 text-center">
        <p className="text-sm font-medium text-foreground">No items yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Create your first item to get started.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/items/${item.id}`}
            className="card-elevated flex items-start justify-between rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-ring/30 group"
          >
            <div className="space-y-0.5 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
              )}
            </div>
            <span className="text-muted-foreground ml-4 shrink-0 group-hover:translate-x-0.5 transition-transform text-sm">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
