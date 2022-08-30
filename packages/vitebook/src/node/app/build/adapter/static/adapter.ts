import { type BuildAdapterFactory } from '../BuildAdapter';

export type StaticBuildAdapterConfig = {
  trailingSlash?: boolean;
};

export function createStaticBuildAdapter(
  options: StaticBuildAdapterConfig = {},
): BuildAdapterFactory {
  return (app, bundles, build, $) => {
    $.logger.info($.color.bold(`vitebook@${app.version}`));

    const startTime = Date.now();
    const renderingSpinner = $.createSpinner();

    const trailingSlash = options.trailingSlash ?? true;
    const trailingSlashTag = !trailingSlash
      ? `<script>window.__VBK_TRAILING_SLASH__ = false;</script>`
      : '';

    return {
      name: 'static',
      startRenderingPages() {
        renderingSpinner.start(
          $.color.bold(
            `Rendering ${$.color.underline(app.nodes.pages.size)} pages...`,
          ),
        );
      },
      finishRenderingPages() {
        renderingSpinner.stopAndPersist({
          symbol: $.icons.success,
          text: $.color.bold(
            `Rendered ${$.color.underline(app.nodes.pages.size)} pages`,
          ),
        });
      },

      async write() {
        // ---------------------------------------------------------------------------------------
        // REDIRECTS
        // ---------------------------------------------------------------------------------------

        let redirectsScriptTag = '';
        const redirectFiles = $.createFilesArray();

        const redirectsTable: Record<string, string> = {};

        for (const redirect of build.redirects.values()) {
          redirectFiles.push({
            filename: redirect.filename,
            content: redirect.html,
          });
          redirectsTable[redirect.from] = redirect.to;
        }

        const serializedRedirectsTable = JSON.stringify(redirectsTable);
        redirectsScriptTag = `<script id="__VBK_REDIRECTS_MAP__">window.__VBK_REDIRECTS_MAP__ = ${serializedRedirectsTable};</script>`;

        // ---------------------------------------------------------------------------------------
        // Data
        // ---------------------------------------------------------------------------------------

        const dataTable: Record<string, string> = {};
        const dataFiles = $.createFilesArray();

        for (const data of build.data.values()) {
          dataFiles.push({
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

        const htmlFiles = $.createFilesArray();

        const buildingSpinner = $.createSpinner();
        const htmlPagesCount = $.color.underline(build.renders.size);

        buildingSpinner.start(
          $.color.bold(`Building ${htmlPagesCount} HTML pages...`),
        );

        const template = $.getHTMLTemplate();
        const entrySrc = bundles.client.entryChunk.fileName;
        const entryScriptTag = `<script type="module" src="/${entrySrc}" defer></script>`;
        const stylesheetTag = bundles.client.appCSSAsset
          ? $.createLinkTag('stylesheet', bundles.client.appCSSAsset.fileName)
          : '';

        for (const render of build.renders.values()) {
          const { assets, imports, dynamicImports } = $.resolvePageChunks(
            render.page,
            render.ssr.context.modules,
          );

          const preloadLinkTags = [...assets, ...imports].map((fileName) =>
            $.createPreloadTag(fileName),
          );

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
            trailingSlashTag,
            entryScriptTag,
          ].join('');

          const pageHtml = template
            .replace(`<!--@vitebook/head-->`, headTags)
            .replace(`<!--@vitebook/app-->`, render.ssr.html)
            .replace('<!--@vitebook/body-->', bodyTags);

          htmlFiles.push({
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
          const sitemapCount = $.color.underline(app.config.sitemap.length);

          sitemapsSpinner.start(
            $.color.bold(`Building ${sitemapCount} sitemaps...`),
          );

          const sitemaps = await $.buildSitemaps();
          for (const [filename, content] of sitemaps) {
            htmlFiles.push({ filename, content });
          }

          sitemapsSpinner.stopAndPersist({
            text: $.color.bold(`Built ${sitemapCount} sitemaps`),
            symbol: $.icons.success,
          });
        }

        // ---------------------------------------------------------------------------------------
        // WRITE
        // ---------------------------------------------------------------------------------------

        await $.writeFiles(
          htmlFiles,
          (filename) => app.dirs.client.resolve(filename),
          (count) => `Writing ${count} HTML files`,
          (count) => `Committed ${count} HTML files`,
        );

        if (redirectFiles.length) {
          await $.writeFiles(
            dataFiles,
            (filename) => app.dirs.client.resolve(filename),
            (count) => `Writing ${count} HTML redirect files`,
            (count) => `Committed ${count} HTML redirect files`,
          );
        }

        if (dataFiles.length) {
          await $.writeFiles(
            dataFiles,
            (filename) => app.dirs.client.resolve(filename),
            (count) => `Writing ${count} data files`,
            (count) => `Committed ${count} data files`,
          );
        }
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

export { createStaticBuildAdapter as default };
