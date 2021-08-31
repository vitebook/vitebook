import type { App } from '../../App.js';

/**
 * Generate client app root components temp file.
 */
export const prepareClientAppRootComponents = async (
  app: App
): Promise<void> => {
  const clientAppRootComponentFiles =
    await app.pluginManager.hooks.clientAppRootComponentFiles.process(app);

  // Flat the hook result to get the file paths array.
  const filePaths = clientAppRootComponentFiles.flat();

  const content = `\
${filePaths
  .map(
    (filePath, index) =>
      `import clientAppRootComponent${index} from '${filePath}'`
  )
  .join('\n')}

export const clientAppRootComponents = [
${filePaths.map((_, index) => `  clientAppRootComponent${index},`).join('\n')}
]
`;

  await app.dirs.tmp.write('internal/clientAppRootComponents.js', content);
};
