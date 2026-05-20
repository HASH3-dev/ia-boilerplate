import { z } from 'zod';
import { routeWrapper } from '@resources/helpers/route-wrapper';
import { RouterError } from '@resources/errors/router-error';
import { bodyValidate } from '@resources/middlewares/body-validate';
import { parametersValidate } from '@resources/middlewares/parameters-validate';
import { callApi } from '@/lib/api-client';

const paramsSchema = z.object({ id: z.string().uuid() });

const updateItemSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
});

export const GET = routeWrapper({
  middlewares: [parametersValidate(paramsSchema)],
})(async (_req, params) => {
  const res = await callApi(`/items/${params.id}`, { method: 'GET' });
  if (!res.ok) throw new RouterError({ status: res.status, message: 'Item not found' });
  return res.json();
});

export const PUT = routeWrapper({
  middlewares: [parametersValidate(paramsSchema), bodyValidate(updateItemSchema)],
})(async (_req, params, body) => {
  const res = await callApi(`/items/${params.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new RouterError({ status: res.status, message: err.message ?? 'Failed to update item' });
  }

  return res.json();
});

export const DELETE = routeWrapper({
  middlewares: [parametersValidate(paramsSchema)],
})(async (_req, params) => {
  const res = await callApi(`/items/${params.id}`, { method: 'DELETE' });
  if (!res.ok) throw new RouterError({ status: res.status, message: 'Failed to delete item' });
  return null;
});
