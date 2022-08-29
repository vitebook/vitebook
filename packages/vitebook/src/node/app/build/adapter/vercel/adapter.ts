import esbuild from 'esbuild';
import path from 'node:path';

import { HTTP_METHODS } from '../../../http';
import { type BuildAdapterFactory } from '../BuildAdapter';
import { createStaticBuildAdapter } from '../static';
import { trailingSlash } from './trailing-slash';

const outputRoot = '.vercel/output';

const defaultFunctionsConfig = {
  runtime: 'nodejs16.x',
  handler: 'index.js',
  maxDuration: 3,
  launcherType: 'Nodejs',
  shouldAddHelpers: true,
  shouldAddSourcemapSupport: true,
};

const defaultEdgeConfig = {
  runtime: 'edge',
  entrypoint: 'index.js',
};

const matchersRE = /\[(?:.*?)\]/g;

export function createVercelBuildAdapter(
  config?: VercelBuildAdapterConfig,
): BuildAdapterFactory {
  const isVercelEnv = !!process.env.VERCEL;

  return async (app, bundles, build, $) => {
    const vercelDirs = {
      root: $.createDirectory(app.dirs.root.resolve(outputRoot)),
      static: $.createDirectory(app.dirs.root.resolve(`${outputRoot}/static`)),
      fns: $.createDirectory(app.dirs.root.resolve(`${outputRoot}/functions`)),
    };

    const staticAdapter = await createStaticBuildAdapter({
      skipOutput: true,
      skipRedirects: isVercelEnv,
    })(app, bundles, build, $);

    return {
      ...staticAdapter,
      name: 'vercel',
      async write() {
        $.rimraf(vercelDirs.root.path);
        $.mkdirp(vercelDirs.root.path);

        await staticAdapter.write?.();

        $.copyDir(app.dirs.client.path, vercelDirs.static.path);

        const redirects = Array.from(build.redirects.values()).map(
          (redirect) => ({
            src: redirect.from,
            headers: { Location: redirect.to },
            status: redirect.statusCode,
          }),
        );

        const overrides: Record<string, { path: string }> = {};
        for (const page of build.renders.values()) {
          overrides[page.filename] = {
            path: $.noendslash(page.filename.replace('index.html', '')),
          };
        }

        const routes: {
          src?: string;
          dest?: string;
          headers?: Record<string, string>;
          status?: number;
          handle?: string;
        }[] = [
          ...(config?.trailingSlash
            ? trailingSlash.keep
            : trailingSlash.remove),
          ...redirects,
          {
            src: '/_immutable/.+',
            headers: { 'Cache-Control': 'public, immutable, max-age=31536000' },
          },
          { handle: 'filesystem' },
        ];

        const bundlingFunctionsSpinner = $.createSpinner();
        const fnCount = $.color.underline(app.nodes.endpoints.size);
        bundlingFunctionsSpinner.start(
          $.color.bold(`Bundling ${fnCount} functions...`),
        );

        for (const endpoint of app.nodes.endpoints) {
          const apiPath = app.dirs.app.relative(endpoint.rootPath);
          const apiDir = path.posix.dirname(apiPath);
          routes.push({
            src: `^${$.slash(apiDir.replace(matchersRE, '([^/]+?)'))}/?$`, // ^/api/foo/?$
            dest: $.slash(apiDir), // /api/foo
          });
        }

        const serverChunks = bundles.server.chunks;
        await Promise.all(
          Array.from(app.nodes.endpoints).map(async (endpoint) => {
            const chunk = serverChunks.find(
              (chunk) => chunk.facadeModuleId === endpoint.filePath,
            );

            const allowedMethods = chunk?.exports.filter((id) =>
              HTTP_METHODS.has(id),
            );

            if (!chunk || !allowedMethods || allowedMethods.length === 0) {
              return;
            }

            const isEdge =
              !!config?.edge?.all || chunk.exports.includes('EDGE');

            const code = resolveFunctionCode(
              endpoint.route.pathname,
              './@http.js',
              allowedMethods,
              isEdge,
            );

            const vcConfig = isEdge
              ? {
                  ...defaultEdgeConfig,
                  envVarsInUse: config?.edge?.envVarsInUse,
                }
              : {
                  ...defaultFunctionsConfig,
                  ...config?.functions,
                };

            const apiPath = app.dirs.app.relative(endpoint.rootPath);
            const fndir = `${path.posix.dirname(apiPath)}.func`;
            const outdir = vercelDirs.fns.resolve(fndir);
            const chunkdir = path.posix.dirname(
              app.dirs.server.resolve(chunk.fileName),
            );
            const entryPath = path.posix.resolve(chunkdir, 'fn.js');

            await $.writeFile(entryPath, code);

            // eslint-disable-next-line import/no-named-as-default-member
            await esbuild.build({
              entryPoints: { index: entryPath },
              outdir,
              target: 'es2020',
              assetNames: 'assets/[name]-[hash]',
              chunkNames: 'chunks/[name]-[hash]',
              bundle: true,
              splitting: true,
              minify: !app.config.isDebug,
              treeShaking: true,
              platform: 'node',
              format: 'esm',
              sourcemap: app.config.isDebug && 'external',
            });

            await $.writeFile(
              path.posix.resolve(outdir, 'package.json'),
              JSON.stringify({ type: 'module' }),
            );

            await $.writeFile(
              path.posix.resolve(outdir, '.vc-config.json'),
              JSON.stringify(vcConfig, null, 2),
            );
          }),
        );

        bundlingFunctionsSpinner.stopAndPersist({
          text: $.color.bold(`Committed ${fnCount} functions`),
          symbol: $.icons.success,
        });

        // SPA fallback so we can render 404 page.
        routes.push({
          src: '/(.*)',
          dest: '/index.html',
        });

        await $.writeFile(
          vercelDirs.root.resolve('config.json'),
          JSON.stringify({ version: 3, routes, overrides }, null, 2),
        );
      },
    };
  };
}

function resolveFunctionCode(
  pattern: string,
  moduleId: string,
  methods: string[],
  isEdge: boolean,
) {
  return [
    isEdge
      ? "import { createHTTPRequestHandler, installURLPattern as installPolyfills } from 'vitebook/http';"
      : [
          "import { createHTTPRequestHandler } from 'vitebook/http';",
          "import { installPolyfills } from 'vitebook/http-polyfills';",
        ].join('\n'),
    '',
    'export default createHTTPRequestHandler(',
    `  () => new URLPattern({ pathname: '${pattern}' }),`,
    `  () => import('${moduleId}'),`,
    '  {',
    `    methods: [${methods.map((method) => `'${method}'`).join(', ')}],`,
    '    getBase: (req) => `https://${req.headers.host}`,',
    "    getClientAddress: (req) => req.headers['x-forwarded-for'],",
    '    installPolyfills,',
    '  }',
    ');',
    '',
  ].join('\n');
}

export { createVercelBuildAdapter as default };

export type VercelBuildAdapterConfig = {
  /**
   * Whether trailing slashes should be kept or removed. The default behaviour is to remove
   * it (e.g., `foo.com/bar/` becomes `foo.com/bar`).
   *
   * @defaultValue false
   */
  trailingSlash?: boolean;
  /**
   * @see {@link https://vercel.com/docs/build-output-api/v3#vercel-primitives/serverless-functions}
   */
  functions?: {
    /**
     * Specifies which "runtime" will be used to execute the Serverless Function.
     *
     * @defaultValue 'nodejs16.x'
     */
    runtime?: string;
    /**
     * Amount of memory (RAM in MB) that will be allocated to the Serverless Function.
     */
    memory?: number;
    /**
     * Maximum execution duration (in seconds) that will be allowed for the Serverless Function.
     *
     * @defaultValue 3
     */
    maxDuration?: number;
    /**
     * Map of additional environment variables that will be available to the Serverless Function,
     * in addition to the env vars specified in the Project Settings.
     */
    environment?: Record<string, string>[];
    /**
     * List of query string parameter names that will be cached independently. If an empty array,
     * query values are not considered for caching. If undefined each unique query value is cached
     * independently.
     */
    allowQuery?: string[];
    /**
     * List of Vercel Regions where the Serverless Function will be deployed to.
     *
     * @see {@link https://vercel.com/docs/concepts/functions/serverless-functions/regions}
     */
    regions?: string[];
  };
  /**
   * @see {@link https://vercel.com/docs/build-output-api/v3#vercel-primitives/edge-functions/configuration}
   */
  edge?: {
    /**
     * Whether all API endpoints should be output as edge functions.
     *
     * @defaultValue false
     */
    all?: boolean;
    /**
     * List of environment variable names that will be available for the Edge Function to utilize.
     *
     * @defaultValue []
     */
    envVarsInUse?: string[];
  };
};
