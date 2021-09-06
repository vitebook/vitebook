import {
  codePlugin as defaultCodePlugin,
  CodePluginOptions as DefaultCodePluginOptions
} from '@vitebook/plugin-markdown';
import type { PluginWithOptions } from 'markdown-it';

export type CodePluginOptions = DefaultCodePluginOptions & {
  /**
   * Add `v-pre` directive to `<pre>` tag or not
   */
  vPre?: boolean;
};

/**
 * Plugin to enable styled code fences with line numbers, syntax highlighting, etc.
 */
export const codePlugin: PluginWithOptions<CodePluginOptions> = (
  parser,
  { vPre = true, ...options }: CodePluginOptions = {}
) => {
  defaultCodePlugin(parser, {
    ...options,
    transformBeforeWrapper(_, token, html) {
      // Get token info
      const info = token.info
        ? parser.utils.unescapeAll(token.info).trim()
        : '';

      // Resolve `v-pre` mark from token info.
      const useVPre = resolveVPre(info) ?? vPre;
      if (useVPre) {
        html = `<pre v-pre${html.slice('<pre'.length)}`;
      }

      html = options.transformBeforeWrapper?.(parser, token, html) ?? html;

      return html;
    }
  });
};

/**
 * Resolve the `:v-pre` / `:no-v-pre` mark from token info.
 */
export const resolveVPre = (info: string): boolean | null => {
  if (/:v-pre\b/.test(info)) {
    return true;
  }

  if (/:no-v-pre\b/.test(info)) {
    return false;
  }

  return null;
};
