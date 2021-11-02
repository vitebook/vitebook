export function noop() {
  //
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
  // @ts-expect-error - No constructor definition
  return value?.constructor === Number && !Number.isNaN(value);
}

/**
 * Check if a value is a `string`.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function isString(value: any): value is string {
  return value?.constructor === String;
}

/**
 * Check if a value is a `boolean`.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function isBoolean(value: any): value is boolean {
  return value?.constructor === Boolean;
}

/**
 * Check if a value is an `array`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function isArray(value: any): value is any[] {
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isObject = <T extends Record<any, any> = Record<any, any>>(
  val: unknown,
): val is T => Object.prototype.toString.call(val) === '[object Object]';
