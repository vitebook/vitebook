/**
 * Locales config, a key-value object:
 *
 * - Key is the locale path.
 * - Value is the locales data.
 */
export type LocaleConfig<T extends LocaleData = LocaleData> = Record<
  string,
  Partial<T>
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LocaleData = Record<string, any>;
