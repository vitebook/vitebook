import kleur from 'kleur';
import path from 'upath';

import { noslash } from '../../../shared';
import { LoggerIcon } from '../../utils';
import type { RoutesLoggerInput } from '../config';
import type { BuildData } from './build';

export function logBadLinks(badLinks: BuildData['badLinks']) {
  if (badLinks.size === 0) return;

  const logs: string[] = [];

  logs.push(
    '',
    `${LoggerIcon.Warn} ${kleur.bold(kleur.underline('BAD LINKS'))}`,
    '',
  );

  for (const [pathname, { page, reason }] of badLinks) {
    logs.push(`- ${kleur.bold(pathname)}`);
    logs.push(`  - Reason: ${reason}`);
    if (page) logs.push(`  - Location: ${page.rootPath}`);
  }

  console.log(logs.join('\n'));
}

export function logRoutesList({ level, ...build }: RoutesLoggerInput) {
  const logs: string[] = [];

  if (level === 'info') {
    logs.push('', `🛣️  ${kleur.bold(kleur.underline('ROUTES'))}`, '');
    for (const link of build.links.keys()) {
      logs.push(`- ${link}`);
    }
  }

  if (/(warn|error)/.test(level) && build.redirects.size > 0) {
    logs.push('', kleur.bold(kleur.underline('REDIRECTS')), '');
    for (const link of build.redirects.keys()) {
      logs.push(kleur.yellow(`- ${link} -> ${build.redirects.get(link)!.to}`));
    }
  }

  if (level === 'error' && build.badLinks.size > 0) {
    logs.push('', kleur.bold(kleur.underline('NOT FOUND')), '');
    for (const link of build.badLinks.keys()) {
      logs.push(kleur.red(`- ${link}`));
    }
  }

  if (logs.length > 0) {
    console.log(logs.join('\n'));
    console.log();
  }
}

export function logRoutesTree({ level, ...build }: RoutesLoggerInput) {
  type TreeDir = {
    name: string;
    path: TreeDir[];
    file: Set<{ name: string; link: string }>;
  };

  const newDir = (name: string): TreeDir => ({
    name,
    path: [],
    file: new Set(),
  });

  const tree = newDir('.');

  const warnOnly = level === 'warn';
  const errorOnly = level === 'error';
  const redirectLinks = new Set(build.redirects.keys());

  const filteredLinks = errorOnly
    ? build.badLinks.keys()
    : warnOnly
    ? new Set([...build.badLinks.keys(), ...redirectLinks])
    : new Set([...build.badLinks.keys(), ...build.links.keys()]);

  for (const link of filteredLinks) {
    const segments = noslash(link).split('/');

    let current = tree;
    for (const segment of segments.slice(0, -1)) {
      let nextDir = current.path.find((dir) => dir.name === segment);

      if (!nextDir) {
        nextDir = newDir(segment);
        current.path.push(nextDir);
      }

      current = nextDir;
    }

    const name = link.endsWith('/') ? 'index.html' : path.basename(link);
    current.file.add({ name, link });
  }

  const PRINT_SYMBOLS = {
    BRANCH: '├── ',
    EMPTY: '',
    INDENT: '    ',
    LAST_BRANCH: '└── ',
    VERTICAL: '│   ',
  };

  const print = (tree: TreeDir, depth: number, precedingSymbols: string) => {
    const lines: string[] = [];

    const files = Array.from(tree.file).sort((a, b) => {
      if (a.name === 'index.html') return -1;
      if (b.name === 'index.html') return 1;
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });

    for (const [index, file] of files.entries()) {
      const isLast = index === files.length - 1 && tree.path.length === 0;
      const line = [precedingSymbols];
      line.push(isLast ? PRINT_SYMBOLS.LAST_BRANCH : PRINT_SYMBOLS.BRANCH);

      if (redirectLinks.has(file.link)) {
        line.push(
          `${kleur.yellow(file.name)} ${kleur.yellow(kleur.bold('(307)'))} -> ${
            build.redirects.get(file.link)!.to
          }`,
        );
      } else if (build.badLinks.has(file.link)) {
        line.push(`${kleur.red(file.name)} ${kleur.red(kleur.bold('(404)'))}`);
      } else {
        line.push(file.name);
      }

      lines.push(line.join(''));
    }

    for (const [index, child] of tree.path.entries()) {
      const line = [precedingSymbols];
      const isLast = index === tree.path.length - 1 && child.path.length === 0;
      line.push(isLast ? PRINT_SYMBOLS.LAST_BRANCH : PRINT_SYMBOLS.BRANCH);
      line.push(kleur.bold(kleur.cyan(child.name)));
      lines.push(line.join(''));
      const dirLines = print(
        child,
        depth + 1,
        precedingSymbols +
          (depth >= 1
            ? isLast
              ? PRINT_SYMBOLS.INDENT
              : PRINT_SYMBOLS.VERTICAL
            : PRINT_SYMBOLS.EMPTY),
      );

      lines.push(...dirLines);
    }

    return lines;
  };

  if (tree.file.size || tree.path.length > 0) {
    if (level === 'info') {
      console.log(`\n🛣️  ${kleur.bold(kleur.underline('ROUTES'))}`, '');
    }

    console.log(kleur.bold(kleur.cyan('.')));
    console.log(print(tree, 1, '').join('\n'));
    console.log();
  }
}
