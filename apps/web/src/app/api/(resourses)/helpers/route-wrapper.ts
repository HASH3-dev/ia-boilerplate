import { NextRequest, NextResponse } from "next/server";
import {
  Observable,
  defer,
  from,
  lastValueFrom,
  mergeMap,
  of,
  switchMap,
} from "rxjs";
import { RouterError } from "../errors/router-error";

export type MiddlewareWrapperType<T> = (
  request: NextRequest,
  extensions: { params: Promise<Record<string, string>> },
) => T;
export type InterceptorWrapperType<
  T extends readonly unknown[] = readonly unknown[],
> = (
  params: { request: NextRequest; args: T },
  handler: Observable<unknown>,
) => Observable<unknown> | Promise<Observable<unknown>>;

export const routeWrapper =
  <T extends readonly unknown[]>(settings?: {
    middlewares?: {
      [K in keyof T]: MiddlewareWrapperType<T[K]>;
    };
    interceptors?: InterceptorWrapperType<{
      [K in keyof T]: T[K];
    }>[];
  }) =>
  (
    cb: (
      request: NextRequest,
      ...mwResponses: {
        [K in keyof T]: Awaited<T[K]>;
      }
    ) => Promise<unknown>,
  ) =>
  async (
    request: NextRequest,
    extensions: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    const { middlewares = [], interceptors = [] } = settings || {};

    try {
      const responses: unknown[] = [];
      for (const middleware of middlewares) {
        const response = await middleware(request, extensions);
        responses.push(response);
      }

      const result = await lastValueFrom(
        of(interceptors).pipe(
          switchMap(async (interceptors) => {
            let acc = defer(() =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cb(request, ...(responses as any)),
            );

            if (interceptors.length === 0) {
              return acc;
            }

            for (const interceptor of interceptors) {
              acc = (await Promise.resolve(
                interceptor({ request, args: responses as unknown as T }, acc),
              )) as unknown as Observable<unknown>;
            }
            return acc;
          }),
          mergeMap((response) => from(response)),
        ),
      );

      if (result instanceof NextResponse) {
        return result;
      }

      return new NextResponse(result ? JSON.stringify(result) : null, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: (request as any).response?.status ?? 200,
      });
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof RouterError) {
        const errorDetails = error.details as Record<string, unknown> | undefined;
        return NextResponse.json(
          {
            status: error.status,
            statusText: error.message,
            ...(errorDetails?.code ? { code: errorDetails.code } : {}),
            details: error.details,
          },
          {
            status: error.status,
          },
        );
      }

      return NextResponse.json(
        {
          status: 500,
          statusText: "Internal Server Error",
        },
        {
          status: 500,
        },
      );
    }
  };
