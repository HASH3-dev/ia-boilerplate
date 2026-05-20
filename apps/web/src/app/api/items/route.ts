import { z } from 'zod';
import { routeWrapper } from '@resources/helpers/route-wrapper';
import { RouterError } from '@resources/errors/router-error';
import { bodyValidate } from '@resources/middlewares/body-validate';
import { callApi } from '@/lib/api-client';

const createItemSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
});

export const GET = routeWrapper()(async () => {
  const res = await callApi('/items', { method: 'GET' });
  if (!res.ok) throw new RouterError({ status: res.status, message: 'Failed to fetch items' });
  return res.json();
});

export const POST = routeWrapper({
  middlewares: [bodyValidate(createItemSchema)],
})(async (_req, body) => {
  const res = await callApi('/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new RouterError({ status: res.status, message: err.message ?? 'Failed to create item' });
  }

  return res.json();
});
