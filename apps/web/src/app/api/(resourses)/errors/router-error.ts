export class RouterError extends Error {
  status: number;
  details?: unknown;

  constructor({
    message,
    status,
    details,
  }: {
    message: string;
    status: number;
    details?: unknown;
  }) {
    super(message);
    this.name = "RouterError";
    this.status = status;
    this.details = details;
  }
}
