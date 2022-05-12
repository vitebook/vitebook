import { type Plugin } from '../Plugin';
import { parseMarkdown } from './parseMarkdown';

export type MarkdownPluginOptions = {
  // ...
};

const INCLUDE_RE = /\.md($|\?)/;

export function markdownPlugin(): Plugin {
  return {
    name: '@vitebook/markdown',
    enforce: 'pre',
    transform(content, id) {
      if (INCLUDE_RE.test(id)) {
        const { output } = parseMarkdown(id, content, {});
        return output;
      }

      return null;
    },
    async handleHotUpdate(ctx) {
      const { file, read } = ctx;

      if (INCLUDE_RE.test(file)) {
        const content = await read();
        const { output } = await parseMarkdown(file, content, {});
        ctx.read = () => output;
      }
    },
  };
}
