import { createInterceptor } from "@resources/helpers/create-interceptor";
import { tap } from "rxjs";

export const httpStatusInterceptor = (status: number) =>
  createInterceptor(({ request }, handler) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return handler.pipe(tap(() => ((request as any).response = { status })));
  });
