// https://github.com/sveltejs/kit/blob/master/packages/kit/src/utils/error.js#L5
export function coalesceToError(err): Error {
  return err instanceof Error || (err && err.name && err.message)
    ? err
    : new Error(JSON.stringify(err));
}
