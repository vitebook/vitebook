import type { App } from '../../App.js';

/**
 * Generate client app enhances temp file.
 */
export const prepareClientAppEnhances = async (app: App): Promise<void> => {
  const clientAppEnhanceFiles =
    await app.pluginManager.hooks.clientAppEnhanceFiles.process(app);

  // Flat the hook result to get the file paths array.
  const filePaths = clientAppEnhanceFiles.flat();

  const content = `\
${filePaths
  .map(
    (filePath, index) => `import clientAppEnhance${index} from '${filePath}'`
  )
  .join('\n')}

export const clientAppEnhances = [
${filePaths.map((_, index) => `  clientAppEnhance${index},`).join('\n')}
]
`;

  await app.dirs.tmp.write('internal/clientAppEnhances.js', content);
};
