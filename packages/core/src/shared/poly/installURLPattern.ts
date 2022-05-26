export async function installURLPattern() {
  // @ts-expect-error - .
  if (!globalThis.URLPattern) {
    // @ts-expect-error - .
    const { URLPattern } = await import('urlpattern-polyfill/urlpattern');
    // @ts-expect-error - .
    globalThis.URLPattern = URLPattern;
  }
}
