export class ClientHttpError extends Error {
  readonly name = 'HttpError' as const;
  constructor(readonly status: number, readonly message = `Error: ${status}`) {
    super(message);
  }
}
