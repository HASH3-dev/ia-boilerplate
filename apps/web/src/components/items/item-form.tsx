'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Item } from '@/types/item';

const itemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(2000).optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface ItemFormProps {
  defaultValues?: Partial<ItemFormValues>;
  onSubmit: (values: ItemFormValues) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ItemForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = 'Save',
}: ItemFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          id="title"
          {...register('title')}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Item title"
        />
        {errors.title && (
          <p className="text-destructive text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          className="w-full border rounded px-3 py-2 text-sm"
          rows={4}
          placeholder="Optional description"
        />
        {errors.description && (
          <p className="text-destructive text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
