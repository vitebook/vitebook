export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

export function isNumber(value: unknown): value is number {
  // @ts-expect-error - No constructor definition
  return value?.constructor === Number && !Number.isNaN(value);
}
