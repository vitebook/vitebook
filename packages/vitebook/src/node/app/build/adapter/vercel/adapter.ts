import { type BuildAdapterFactory } from '../BuildAdapter';
import { createStaticBuildAdapter } from '../static';

const outputRoot = '.vercel/output';

export function createVercelBuildAdapter(): BuildAdapterFactory {
  return async (app, bundles, build, $) => {
    const vercel = {
      root: $.createDirectory(app.dirs.root.resolve(`${outputRoot}`)),
      static: $.createDirectory(app.dirs.root.resolve(`${outputRoot}/static`)),
      fns: $.createDirectory(app.dirs.root.resolve(`${outputRoot}/functions`)),
    };

    $.rimraf(vercel.root.path);
    $.mkdirp(vercel.root.path);

    const staticAdapter = await createStaticBuildAdapter({
      skipOutput: true,
      skipRedirects: true,
    })(app, bundles, build, $);

    return {
      ...staticAdapter,
      name: 'vercel',
      async write() {
        await staticAdapter.write!();

        $.copyDir(app.dirs.client.path, vercel.static.path);
        $.rimraf(vercel.static.resolve('ssr-manifest.json'));

        // ALL WE NEED IS ROUTES - FUCK REST
        // .vercel/output/config.json
        // type Config = {
        //   version: 3;
        //   routes?: Route[];
        // };

        // .vercel/output/functions/api/posts.func
        // .vercel/output/functions/<name>.func/.vc-config.json
        // type ServerlessFunctionConfig = {
        //   handler: string;
        //   runtime: string;
        //   memory?: number;
        //   maxDuration?: number;
        //   environment: Record<string, string>[];
        //   allowQuery?: string[];
        //   regions?: string[];
        // };
        // type NodejsServerlessFunctionConfig = ServerlessFunctionConfig & {
        //   launcherType: 'Nodejs';
        //   shouldAddHelpers?: boolean; // default: false
        //   shouldAddSourceMapSupport?: boolean; // default: false
        // };
        //         {
        //   "runtime": "nodejs16.x",
        //   "handler": "serve.js",
        //   "maxDuration": 3,
        //   "launcherType": "Nodejs",
        //   "shouldAddHelpers": true,
        //   "shouldAddSourcemapSupport": true
        // }

        // type EdgeFunctionConfig = {
        //   runtime: 'edge';
        //   entrypoint: string;
        //   envVarsInUse?: string[];
        // };
        // {
        //   "runtime": "edge",
        //   "entrypoint": "index.js",
        //   "envVarsInUse": ["DATABASE_API_KEY"]
        // }

        // REDIRECTS
        // "src": "/(.*)",
        // "status": 307,
        // "headers": { "Location": "https://example.com/$1" }

        // bundle server functions as entry points -> server/functions/*
        // bundle as needed for each entry point or just bundle all together
        // output and insert route pattern at top of head?

        // handle functions -> server/manifest? (bundle together?)
      },
    };
  };
}

export { createVercelBuildAdapter as default };
