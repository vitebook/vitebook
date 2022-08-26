/**
 * Taken from: https://github.com/sveltejs/kit/blob/master/packages/kit/src/core/prerender/crawl.js
 */

const DOCTYPE = 'DOCTYPE';
const CDATA_OPEN = '[CDATA[';
const CDATA_CLOSE = ']]>';
const COMMENT_OPEN = '--';
const COMMENT_CLOSE = '-->';

const TAG_OPEN = /[a-zA-Z]/;
const TAG_CHAR = /[a-zA-Z0-9]/;
const ATTRIBUTE_NAME = /[^\t\n\f />"'=]/;

const WHITESPACE = /[\s\n\r]/;

export function crawl(html: string) {
  const hrefs: string[] = [];

  let i = 0;
  main: while (i < html.length) {
    const char = html[i];

    if (char === '<') {
      if (html[i + 1] === '!') {
        i += 2;

        if (html.slice(i, i + DOCTYPE.length).toUpperCase() === DOCTYPE) {
          i += DOCTYPE.length;
          while (i < html.length) {
            if (html[i++] === '>') {
              continue main;
            }
          }
        }

        // skip cdata
        if (html.slice(i, i + CDATA_OPEN.length) === CDATA_OPEN) {
          i += CDATA_OPEN.length;
          while (i < html.length) {
            if (html.slice(i, i + CDATA_CLOSE.length) === CDATA_CLOSE) {
              i += CDATA_CLOSE.length;
              continue main;
            }

            i += 1;
          }
        }

        // skip comments
        if (html.slice(i, i + COMMENT_OPEN.length) === COMMENT_OPEN) {
          i += COMMENT_OPEN.length;
          while (i < html.length) {
            if (html.slice(i, i + COMMENT_CLOSE.length) === COMMENT_CLOSE) {
              i += COMMENT_CLOSE.length;
              continue main;
            }

            i += 1;
          }
        }
      }

      // parse opening tags
      const start = ++i;
      if (TAG_OPEN.test(html[start])) {
        while (i < html.length) {
          if (!TAG_CHAR.test(html[i])) {
            break;
          }

          i += 1;
        }

        const tag = html.slice(start, i).toUpperCase();

        if (tag === 'SCRIPT' || tag === 'STYLE') {
          while (i < html.length) {
            if (
              html[i] === '<' &&
              html[i + 1] === '/' &&
              html.slice(i + 2, i + 2 + tag.length).toUpperCase() === tag
            ) {
              continue main;
            }

            i += 1;
          }
        }

        let href = '';
        const rel = '';

        while (i < html.length) {
          const start = i;

          const char = html[start];
          if (char === '>') break;

          if (ATTRIBUTE_NAME.test(char)) {
            i += 1;

            while (i < html.length) {
              if (!ATTRIBUTE_NAME.test(html[i])) {
                break;
              }

              i += 1;
            }

            const name = html.slice(start, i).toLowerCase();

            while (WHITESPACE.test(html[i])) i += 1;

            if (html[i] === '=') {
              i += 1;
              while (WHITESPACE.test(html[i])) i += 1;

              let value: string;

              if (html[i] === "'" || html[i] === '"') {
                const quote = html[i++];

                const start = i;
                let escaped = false;

                while (i < html.length) {
                  if (!escaped) {
                    const char = html[i];

                    if (html[i] === quote) {
                      break;
                    }

                    if (char === '\\') {
                      escaped = true;
                    }
                  }

                  i += 1;
                }

                value = html.slice(start, i);
              } else {
                const start = i;
                while (html[i] !== '>' && !WHITESPACE.test(html[i])) i += 1;
                value = html.slice(start, i);

                i -= 1;
              }

              if (name === 'href') {
                href = value;
              }
            } else {
              i -= 1;
            }
          }

          i += 1;
        }

        if (href && !/\bexternal\b/i.test(rel)) {
          hrefs.push(href);
        }
      }
    }

    i += 1;
  }

  return hrefs;
}
