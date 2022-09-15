import { isNumber } from 'shared/utils/unit';

export class HttpError extends Error {
  readonly name = 'HttpError' as const;
  readonly status: number;

  constructor(
    message: string,
    public readonly init?: number | ResponseInit,
    public readonly data?: Record<string, unknown>,
  ) {
    super(message);
    this.status = isNumber(init) ? init : init?.status ?? 200;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}
