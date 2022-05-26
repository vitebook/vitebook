export const prettyJsonStr = (obj: unknown): string =>
  JSON.stringify(obj, undefined, 2);

export const stripImportQuotesRE = /"\(\) => import\((.+)\)"/g;

/**
 * `JSON.stringify()` will add quotes `""` around dynamic imports which means they'll be a
 * string, not a dynamic import anymore. This function will strip the quotes to make it a
 * dynamic import again.
 */
export function stripImportQuotesFromJson(json: string): string {
  return json.replace(stripImportQuotesRE, `() => import($1)`);
}

/**
 * `upath` is normalizing paths to posix but messing up regex in filepath so they don't match by
 * converting `\` to `/`.
 */
export function fixRegexInPath(filePath: string) {
  return filePath.replace(/\(.*\)/, (m) => m.replace(/\//g, '\\'));
}
