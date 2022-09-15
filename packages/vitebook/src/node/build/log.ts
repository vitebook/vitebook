import kleur from 'kleur';
import type { EndpointFileRoute, PageFileRoute, RoutesLoggerInput } from 'node';
import { LoggerIcon } from 'node/utils';
import { noslash } from 'shared/utils/url';

import type { BuildData } from './build';

export function logBadLinks(badLinks: BuildData['badLinks']) {
  if (badLinks.size === 0) return;

  const logs: string[] = [
    '',
    `${LoggerIcon.Warn} ${kleur.bold(kleur.underline('BAD LINKS'))}`,
    '',
  ];

  for (const [pathname, { route, reason }] of badLinks) {
    logs.push(`- ${kleur.bold(pathname)}`);
    logs.push(`  - Reason: ${reason}`);
    if (route) logs.push(`  - Location: ${route.file.rootPath}`);
  }

  console.log(logs.join('\n'));
}

export function logRoutesList({ level, ...build }: RoutesLoggerInput) {
  const logs: string[] = [];

  if (level === 'info') {
    logs.push('', `📄 ${kleur.bold(kleur.underline('STATIC PAGES'))}`, '');
    for (const link of build.links.keys()) {
      const page = build.links.get(link)!;
      const route = page.pattern.pathname
        .replace('{/}?{index}?{.html}?', '')
        .slice(1);
      const pathname = link.slice(1, -1);
      const pattern = pathname !== route ? kleur.dim(` (${route})`) : '';
      logs.push(
        `- ${kleur.cyan(
          link.length === 1 ? 'index.html' : `${pathname}/index${'.html'}`,
        )}${pattern}`,
      );
    }
  }

  if (level === 'info' && build.serverPages.size > 0) {
    logs.push('', `⚙️  ${kleur.bold(kleur.underline('SERVER PAGES'))}`, '');
    for (const route of Array.from(build.serverPages).reverse()) {
      if (route.type === 'page') {
        logs.push(`- ${kleur.cyan(route.file.routeDir)}`);
      }
    }
  }

  if (level === 'info' && build.serverEndpoints.size > 0) {
    logs.push('', `⚙️  ${kleur.bold(kleur.underline('SERVER ENDPOINTS'))}`, '');
    for (const route of Array.from(build.serverEndpoints).reverse()) {
      logs.push(`- ${kleur.cyan(route.file.routeDir)}`);
    }
  }

  if (/(info|warn)/.test(level) && build.staticRedirects.size > 0) {
    logs.push('', `➡️  ${kleur.bold(kleur.underline('STATIC REDIRECTS'))}`, '');
    for (const link of build.staticRedirects.keys()) {
      const redirect = build.staticRedirects.get(link)!;
      logs.push(
        `- ${kleur.yellow(link)} -> ${kleur.yellow(redirect.to)} (${
          redirect.status
        })`,
      );
    }
  }

  if (/(info|warn|error)/.test(level) && build.badLinks.size > 0) {
    logs.push('', `🛑 ${kleur.bold(kleur.underline('NOT FOUND'))}`, '');
    for (const link of build.badLinks.keys()) {
      logs.push(`- ${kleur.red(link)} (404)`);
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
    info?: string;
    route?: boolean;
    badLink?: boolean;
    icon?: string;
    static?: boolean;
    redirect?: {
      path: string;
      status: number;
    };
  };

  const newDir = (name: string): TreeDir => ({
    name,
    path: [],
  });

  const tree = newDir('.');

  const warnOnly = level === 'warn';
  const errorOnly = level === 'error';
  const redirectLinks = new Set(build.staticRedirects.keys());

  const serverPages = new Map<string, PageFileRoute>();
  for (const page of build.serverPages) {
    serverPages.set(page.file.pathname, page);
  }

  const serverEndpoints = new Map<string, EndpointFileRoute>();
  for (const endpoint of build.serverEndpoints) {
    serverEndpoints.set(endpoint.file.pathname, endpoint);
  }

  const filteredLinks = errorOnly
    ? build.badLinks.keys()
    : warnOnly
    ? new Set([...build.badLinks.keys(), ...redirectLinks])
    : new Set([
        ...build.badLinks.keys(),
        ...redirectLinks,
        ...build.links.keys(),
        ...serverPages.keys(),
        ...serverEndpoints.keys(),
      ]);

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

    if (build.badLinks.has(link)) {
      current.badLink = true;
    } else if (build.staticRedirects.has(link)) {
      const redirect = build.staticRedirects.get(link)!;
      current.redirect = {
        path: redirect.to.slice(1, -1),
        status: redirect.status,
      };
    } else {
      current.route = true;
      if (build.links.has(link)) {
        current.icon = '📄';
        current.static = true;
      } else if (serverEndpoints.has(link)) {
        current.info = kleur.magenta('+http');
      }
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
        ? kleur.yellow(
            `${dir.name} -> ${dir.redirect.path} (${dir.redirect.status})`,
          )
        : `${kleur[dir.static ? 'cyan' : dir.route ? 'magenta' : 'white'](
            dir.name,
          )}${kleur.dim(dir.info ?? '')}`;

      line.push(isLast ? PRINT_SYMBOLS.LAST_BRANCH : PRINT_SYMBOLS.BRANCH);
      line.push(kleur.bold(`${dir.icon ? `${dir.icon}` : ''}${name}`));
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
      console.log(`\n${kleur.bold(kleur.underline('ROUTES'))}`, '');
    }

    console.log(
      kleur.bold(
        build.links.has('/') ? kleur.cyan('\n📄.') : kleur.magenta('.'),
      ),
    );
    console.log(print(tree, 1, '').join('\n'));
  }
}
