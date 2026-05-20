import { RouterError } from "@resources/errors/router-error";
import { createMiddleware } from "@resources/helpers/create-middleware";
import z from "zod";

export const parametersValidate = <
  R extends z.infer<T>,
  T extends z.ZodType = z.ZodType,
>(
  param: string,
  zodSchema: T,
  transform: (value: unknown) => R = (v) => v as R,
) =>
  createMiddleware(async (_, { params }) => {
    const val = (await params)[param];

    try {
      return transform(zodSchema.parse(val)) as R;
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        throw new RouterError({
          message: "Invalid route parameter: " + param,
          status: 400,
          details: error.issues,
        });
      }

      throw error;
    }
  });
