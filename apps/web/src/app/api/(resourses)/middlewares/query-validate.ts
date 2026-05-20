import { createMiddleware } from "@resources/helpers/create-middleware";
import * as z from "zod";
import { RouterError } from "../errors/router-error";

export const queryValidate = <
  R extends z.infer<T>,
  T extends z.ZodType = z.ZodType,
>(
  zodSchema: T,
) =>
  createMiddleware(async (request) => {
    const { searchParams } = new URL(request.url);
    const body = Object.fromEntries(searchParams.entries());

    try {
      return zodSchema.parse(body) as R;
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        throw new RouterError({
          message: "Invalid query parameters",
          status: 400,
          details: error.issues,
        });
      }

      throw error;
    }
  });
