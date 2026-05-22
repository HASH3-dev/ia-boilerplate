import { RouterError } from "@resources/errors/router-error";
import { createMiddleware } from "@resources/helpers/create-middleware";
import z from "zod";

export const parametersValidate = <T extends z.ZodType>(zodSchema: T) =>
  createMiddleware(async (_, { params }) => {
    const val = await params;

    try {
      return zodSchema.parse(val) as z.infer<T>;
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        throw new RouterError({
          message: "Invalid route parameters",
          status: 400,
          details: error.issues,
        });
      }

      throw error;
    }
  });
