import { InterceptorWrapperType } from "./route-wrapper";

export const createInterceptor = <T extends readonly unknown[]>(
  cb: InterceptorWrapperType<{
    [K in keyof T]: T[K];
  }>,
) => {
  return cb;
};
