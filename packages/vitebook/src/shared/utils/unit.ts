export function noop() {
  //
}

export function safeNotEqual(a: unknown, b: unknown) {
  return a != a
    ? b == b
    : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

/**
 * Check if a value is `undefined`.
 */
export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

/**
 * Check if a value is `null`.
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Check if a value is a `number`.
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Check if a value is a `string`.
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if a value is a `boolean`.
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Check if a value is an `array`.
 */
export function isArray(value: unknown): value is any[] {
  return Array.isArray(value);
}

/**
 * Check if a value is a `function`.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * Check if a value is plain `object`.
 */
export const isObject = <T extends Record<any, any> = Record<any, any>>(
  val: unknown,
): val is T => Object.prototype.toString.call(val) === '[object Object]';
