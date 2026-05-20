import { MiddlewareWrapperType } from "./route-wrapper";

export const createMiddleware = <T>(cb: MiddlewareWrapperType<T>) => {
  return cb;
};
