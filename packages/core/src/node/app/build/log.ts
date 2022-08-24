import kleur from 'kleur';

import { noslash } from '../../../shared';
import { LoggerIcon } from '../../utils';
import type { RoutesLoggerInput } from '../config';
import type { BuildData } from './build';

export function logBadLinks(badLinks: BuildData['badLinks']) {
  if (badLinks.size === 0) return;

  const logs: string[] = [
    '',
    `${LoggerIcon.Warn} ${kleur.bold(kleur.underline('BAD LINKS'))}`,
    '',
  ];

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
      const page = build.links.get(link);

      let pathname = '';
      if (page && page.route?.dynamic) {
        pathname = kleur.dim(
          ` (${page.route.pathname.replace('{/}?{index}?{.html}?', '/')})`,
        );
      }

      logs.push(`- ${link}${pathname}`);
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
    link?: string;
    badLink?: boolean;
    redirect?: string;
  };

  const newDir = (name: string): TreeDir => ({
    name,
    path: [],
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

      current.link = undefined;
      current = nextDir;
    }

    if (build.badLinks.has(link)) {
      current.badLink = true;
    } else if (build.redirects.has(link)) {
      current.redirect = build.redirects.get(link)!.to;
    } else {
      const route = build.links.get(link)!.route!;
      const pathname = route.pathname.replace('{/}?{index}?{.html}?', '/');
      current.link = kleur.dim(` (${pathname})`);
    }
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

    for (const [index, dir] of tree.path.entries()) {
      const line = [precedingSymbols];
      const isLast = index === tree.path.length - 1 && dir.path.length === 0;

      const name = dir.badLink
        ? `${kleur.red(dir.name)} ${kleur.red(kleur.bold('(404)'))}`
        : dir.redirect
        ? kleur.yellow(`${dir.name} -> ${dir.redirect} (307)`)
        : kleur[dir.path.length === 0 ? 'cyan' : 'white'](
            `${dir.name}${dir.link ?? ''}`,
          );

      line.push(isLast ? PRINT_SYMBOLS.LAST_BRANCH : PRINT_SYMBOLS.BRANCH);
      line.push(kleur.bold(name));
      lines.push(line.join(''));

      const dirLines = print(
        dir,
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

  if (tree.path.length > 0) {
    if (level === 'info') {
      console.log(`\n🛣️  ${kleur.bold(kleur.underline('ROUTES'))}`, '');
    }

    console.log(kleur.bold(kleur.cyan('.')));
    console.log(print(tree, 1, '').join('\n'));
    console.log();
  }
}
