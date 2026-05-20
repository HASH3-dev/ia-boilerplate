import { createMiddleware } from "@resources/helpers/create-middleware";
import * as z from "zod";
import { RouterError } from "../errors/router-error";

export const bodyValidate = <
  R extends z.infer<T>,
  T extends z.ZodType = z.ZodType,
>(
  zodSchema: T,
) =>
  createMiddleware(async (request) => {
    const body = await request.json();

    try {
      return zodSchema.parse(body) as R;
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        throw new RouterError({
          message: "Invalid request body",
          status: 400,
          details: error.issues,
        });
      }

      throw error;
    }
  });
