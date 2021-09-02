export const prettyJsonStr = (obj: unknown): string =>
  JSON.stringify(obj, undefined, 2);
