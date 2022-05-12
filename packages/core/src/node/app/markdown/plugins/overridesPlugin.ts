import type { PluginWithOptions } from 'markdown-it';
import type Token from 'markdown-it/lib/token';
import containerIt from 'markdown-it-container';

import { isString } from '../../../../shared';

export type InlineElementRule =
  | 'emphasized'
  | 'image'
  | 'strikethrough'
  | 'strong';

export type BlockElementRule =
  | 'blockquote'
  | 'heading'
  | 'list_item'
  | 'ordered_list'
  | 'paragraph'
  | 'table'
  | 'bullet_list';

export type MarkdownInlineOverride = {
  type: 'inline';
  tagName: string;
  rule: InlineElementRule;
};

export type MarkdownBlockOverride = {
  type: 'block';
  tagName: string;
  rule: BlockElementRule;
};

export type MarkdownContainerOverride = {
  type: 'container';
  tagName: string;
  container: MarkdownContainer;
};

export type MarkdownContainer = {
  name: string;
  marker?: string;
  renderer?(componentName: string): (tokens: Token[], idx: number) => string;
};

export type MarkdownOverride = (
  | MarkdownInlineOverride
  | MarkdownBlockOverride
  | MarkdownContainerOverride
)[];

export type OverridesPluginOptions = MarkdownOverride;

export const overridesPlugin: PluginWithOptions<OverridesPluginOptions> = (
  parser,
  options,
) => {
  const overrides = options ?? [];

  const inline = overrides.filter(
    (o) => o.type === 'inline',
  ) as MarkdownInlineOverride[];

  const block = overrides.filter(
    (o) => o.type === 'block',
  ) as MarkdownBlockOverride[];

  const containers = overrides.filter(
    (o) => o.type === 'container',
  ) as MarkdownContainerOverride[];

  const inlineRuleMap: Partial<Record<InlineElementRule, string>> = {
    strikethrough: 's',
    emphasized: 'em',
  };

  for (const { tagName, rule } of inline) {
    if (rule === 'image') {
      parser.renderer.rules.image = function (tokens, idx, _, __, self) {
        const token = tokens[idx];
        return `<${tagName} ${self.renderAttrs(token)} />`;
      };
      continue;
    }

    const mappedRule = inlineRuleMap[rule] ?? rule;
    parser.renderer.rules[`${mappedRule}_open`] = () => {
      return `<${tagName}>`;
    };
    parser.renderer.rules[`${mappedRule}_close`] = () => {
      return `</${tagName}>`;
    };
  }

  for (const { tagName, rule } of block) {
    parser.renderer.rules[`${rule}_open`] = (tokens, idx) => {
      const token = tokens[idx];
      const props: string[] = [];

      if (/h(\d)/.test(token.tag)) {
        props.push(`level=${token.tag.slice(1)}`);
      }

      return `<${tagName} ${props.join(' ')}>`;
    };
    parser.renderer.rules[`${rule}_close`] = () => {
      return `</${tagName}>`;
    };
  }

  const propsRE = /(?:\s|\|)(.*?)=(.*?)(?=(\||$))/g;
  const bodyRE = /\((.*?)\)(?:=)(.*)/;
  const tagRE = /tag=(.*?)(?:&|\))/;
  const slotRE = /slot=(.*?)(?:&|\))/;
  const defaultContainerRender =
    (tagName: string) => (tokens: Token[], idx: number) => {
      const token = tokens[idx];
      const props: string[] = [];
      const body: string[] = [];

      const matchedProps = token.info.trim().matchAll(propsRE);

      for (const [propMatch, prop, value] of matchedProps) {
        if (bodyRE.test(propMatch)) {
          const [_, __, content] = propMatch.match(bodyRE) ?? [];
          const tag = propMatch.match(tagRE)?.[1] ?? 'p';
          const slot = propMatch.match(slotRE)?.[1];
          if (isString(tag) && isString(content)) {
            body.push(
              [
                `<${tag}${isString(slot) ? ` slot="${slot}"` : ''}>`,
                parser
                  .render(content)
                  .replace(/^<p>/, '')
                  .replace(/<\/p>\n?$/, ''),
                `</${tag}>`,
              ].join('\n'),
            );
          }
        } else if (isString(prop) && isString(value)) {
          props.push(`${prop}=${value}`);
        }
      }

      if (token.nesting === 1) {
        return `<${tagName} ${props.join(' ')}>\n ${body.join('\n ')}\n`;
      } else {
        return `</${tagName}>\n`;
      }
    };

  for (const { tagName, container: options } of containers) {
    const name: string = options.name;
    const marker: string = options.marker ?? ':';
    const render =
      options?.renderer?.(tagName) ?? defaultContainerRender(tagName);
    parser.use(containerIt, name, { marker, render });
  }
};
