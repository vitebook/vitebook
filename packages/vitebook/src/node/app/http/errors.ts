export function invariant(value: boolean, message?: string): asserts value;

export function invariant<T>(
  value: T | null | undefined,
  message?: string,
): asserts value is T;

/**
 * Throws HTTP bad request (status code 400) if the value is `false`, `nul`, or `undefined`.
 */
export function invariant(value: unknown, message?: string) {
  if (value === false || value === null || typeof value === 'undefined') {
    throw new httpError(400, message);
  }
}

/**
 * Throws HTTP validation error (status code 422) if the condition is false.
 */
export function validate(condition: boolean, message?: string) {
  if (!condition) throw new httpError(422, message);
}

/**
 * Throws a `HTTPError` to easily escape handling the request and respond with the given status
 * code and optional message.
 */
export function httpError(statusCode: number, message?: string) {
  throw new HTTPError(statusCode, message);
}

/**
 * Throws a `HTTPError` to easily escape handling the request and respond with the given status
 * code and optional JSON data.
 */
export function httpJSONError(
  statusCode: number,
  data: Record<string, unknown> = {},
) {
  throw new HTTPJSONError(statusCode, data);
}

export class HTTPError extends Error {
  constructor(public readonly statusCode: number, message?: string) {
    super(message);
  }
}

export class HTTPJSONError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly data: Record<string, unknown>,
  ) {
    super();
  }
}

export function isHTTPError(error: unknown): error is HTTPError {
  return error instanceof HTTPError;
}

export function isHTTPJSONError(error: unknown): error is HTTPJSONError {
  return error instanceof HTTPJSONError;
}
