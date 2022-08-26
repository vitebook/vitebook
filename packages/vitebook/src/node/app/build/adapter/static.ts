import path from 'upath';

import { type BuildAdapterFactory } from './BuildAdapter';

export function createStaticBuildAdapter(
  options: {
    skipOutput?: boolean;
    skipRedirects?: boolean;
  } = {},
): BuildAdapterFactory {
  return (app, bundles, build, $) => {
    $.logger.info($.color.bold(`vitebook@${app.version}`));

    const startTime = Date.now();
    const renderingSpinner = $.createSpinner();

    return {
      name: 'static',
      startRenderingPages() {
        renderingSpinner.start(
          $.color.bold(`Rendering ${app.nodes.pages.size} pages...`),
        );
      },
      finishRenderingPages() {
        renderingSpinner.stopAndPersist({
          symbol: $.icons.success,
          text: $.color.bold(
            `Rendered ${$.color.underline(build.links.size)} pages`,
          ),
        });
      },

      async write() {
        const files: { filename: string; content: string }[] = [];

        // ---------------------------------------------------------------------------------------
        // REDIRECTS
        // ---------------------------------------------------------------------------------------

        let redirectsScriptTag = '';

        if (!options.skipRedirects) {
          const redirectsTable: Record<string, string> = {};

          for (const redirect of build.redirects.values()) {
            files.push({
              filename: redirect.filename,
              content: redirect.html,
            });
            redirectsTable[redirect.from] = redirect.to;
          }

          const serializedRedirectsTable = JSON.stringify(redirectsTable);
          redirectsScriptTag = `<script id="__VBK_REDIRECTS_MAP__">window.__VBK_REDIRECTS_MAP__ = ${serializedRedirectsTable};</script>`;
        }

        // ---------------------------------------------------------------------------------------
        // Data
        // ---------------------------------------------------------------------------------------

        const dataTable: Record<string, string> = {};

        for (const data of build.data.values()) {
          files.push({
            filename: data.filename,
            content: data.serializedData,
          });
          dataTable[data.idHash] = data.contentHash;
        }

        const serializedDataTable = JSON.stringify(dataTable);
        const dataHashScriptTag = `<script id="__VBK_DATA_HASH_MAP__">window.__VBK_DATA_HASH_MAP__ = ${serializedDataTable};</script>`;

        // ---------------------------------------------------------------------------------------
        // HTML Pages
        // ---------------------------------------------------------------------------------------

        const buildingSpinner = $.createSpinner();
        const htmlPagesCount = $.color.underline(build.renders.size);
        buildingSpinner.start(
          $.color.bold(`Building ${htmlPagesCount} HTML pages...`),
        );

        const template = $.getHTMLTemplate();
        const entryScriptTag = `<script type="module" src="/${bundles.client.entryChunk.fileName}" defer></script>`;
        const stylesheetTag = bundles.client.appCSSAsset
          ? $.createLinkTag('stylesheet', bundles.client.appCSSAsset.fileName)
          : '';

        for (const render of build.renders.values()) {
          const { imports, dynamicImports } = $.resolvePageImports(render.page);
          const manifestImports = $.resolveImportsFromSSRManifest(
            render.ssr.context.modules,
          );

          const preloadLinkTags = Array.from(
            new Set([...imports, ...manifestImports]),
          ).map((fileName) => $.createPreloadTag(fileName));

          const prefetchLinkTags = dynamicImports.map((fileName) =>
            $.createLinkTag('prefetch', fileName),
          );

          const headTags = [
            render.ssr.head ?? '',
            stylesheetTag,
            ...preloadLinkTags,
            ...prefetchLinkTags,
          ]
            .filter((t) => t.length > 0)
            .join('\n    ');

          const bodyTags = [
            redirectsScriptTag,
            dataHashScriptTag,
            $.createDataScriptTag(render.dataAssetIds),
            entryScriptTag,
          ].join('');

          const pageHtml = template
            .replace(`<!--@vitebook/head-->`, headTags)
            .replace(`<!--@vitebook/app-->`, render.ssr.html)
            .replace('<!--@vitebook/body-->', bodyTags);

          files.push({
            filename: render.filename,
            content: pageHtml,
          });
        }

        buildingSpinner.stopAndPersist({
          text: $.color.bold(`Built ${htmlPagesCount} HTML pages`),
          symbol: $.icons.success,
        });

        // ---------------------------------------------------------------------------------------
        // SITEMAPS
        // ---------------------------------------------------------------------------------------

        if (app.config.sitemap.length > 0) {
          const sitemapsSpinner = $.createSpinner();
          sitemapsSpinner.start($.color.bold('Building sitemaps...'));

          const sitemaps = await $.buildSitemaps();
          for (const [filename, content] of sitemaps) {
            files.push({ filename, content });
          }

          sitemapsSpinner.stopAndPersist({
            text: $.color.bold(`Built sitemaps`),
            symbol: $.icons.success,
          });
        }

        // ---------------------------------------------------------------------------------------
        // WRITE
        // ---------------------------------------------------------------------------------------

        const writingSpinner = $.createSpinner();
        const filesCount = $.color.underline(files.length);
        writingSpinner.start($.color.bold(`Writing ${filesCount} files...`));

        await Promise.all(
          files.map(async ({ filename, content }) => {
            const filePath = app.dirs.client.resolve(filename);
            await $.ensureDir(path.dirname(filePath));
            await $.writeFile(filePath, content);
          }),
        );

        if (!options.skipOutput) {
          $.copyDir(app.dirs.client.path, app.dirs.build.path);
        }

        writingSpinner.stopAndPersist({
          text: $.color.bold(`Committed ${filesCount} files`),
          symbol: $.icons.success,
        });
      },
      async close() {
        $.logBadLinks();
        $.logRoutes();

        const icons = {
          10: '🤯',
          20: '🏎️',
          30: '🏃',
          40: '🐌',
          Infinity: '⚰️',
        };

        const endTime = ((Date.now() - startTime) / 1000).toFixed(2);
        const formattedEndTime = $.color.underline(endTime);
        const icon = icons[Object.keys(icons).find((t) => endTime <= t)!];

        $.logger.success(
          $.color.bold(`Build complete in ${formattedEndTime} ${icon}`),
        );

        const pkgManager = await $.guessPackageManager();
        const previewCommand = await $.findPreviewScriptName();

        console.log(
          $.color.bold(
            `⚡ ${
              previewCommand
                ? `Run \`${
                    pkgManager === 'npm' ? 'npm run' : pkgManager
                  } ${previewCommand}\` to serve production build`
                : 'Ready for preview'
            }\n`,
          ),
        );
      },
    };
  };
}
