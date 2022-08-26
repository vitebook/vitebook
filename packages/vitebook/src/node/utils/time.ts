/**
 * Formats a number in milliseconds to a `string` with time units.
 *
 * @example '20.34ms'
 * @example '23s'
 * @example '2m'
 * @see https://github.com/vercel/ms
 */
export function ms(val: number): string {
  const s = 1000;
  const m = s * 60;

  const msAbs = Math.abs(val);

  if (msAbs >= m) {
    return Math.round(val / m) + 'm';
  }

  if (msAbs >= s) {
    return Math.round(val / s) + 's';
  }

  return Number(val.toFixed(2)) + 'ms';
}
