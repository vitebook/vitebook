export const EXTERNAL_URL_REGEX = /^https?:/i;

/**
 * Determine if a link is a http link or not.
 *
 * - http://github.com
 * - https://github.com
 * - //github.com
 */
export const isLinkHttp = (link: string): boolean =>
  /^(https?:)?\/\//.test(link);

/**
 * Determine if a link is external or not.
 */
export const isLinkExternal = (link: string, base = '/'): boolean => {
  // http link
  if (isLinkHttp(link)) {
    return true;
  }

  // absolute link that does not start with `base`
  if (link.startsWith('/') && !link.startsWith(base)) {
    return true;
  }

  return false;
};

/**
 * Determine if a link is a `mailto` address or not.
 */
export const isLinkMailto = (link: string): boolean => /^mailto:/.test(link);

/**
 * Determine if a link is a `tel` address or not
 */
export const isLinkTel = (link: string): boolean => /^tel:/.test(link);
