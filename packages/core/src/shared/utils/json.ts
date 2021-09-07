export const prettyJsonStr = (obj: unknown): string =>
  JSON.stringify(obj, undefined, 2);

export const stripImportQuotesRE = /"\(\) => import\((.+)\)"/g;

/**
 * `JSON.stringify()` will add quotes `""` around dynamic imports which means they'll be a
 * string, not a dynamic import anymore. This function will strip the quotes to make it a
 * dynamic import again.
 */
export function stripImportQuotesFromJson(json: string): string {
  return json.replace(stripImportQuotesRE, '() => import($1)');
}
