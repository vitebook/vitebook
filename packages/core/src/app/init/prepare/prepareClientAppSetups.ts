import type { App } from '../../App.js';

/**
 * Generate client app setups temp file.
 */
export const prepareClientAppSetups = async (app: App): Promise<void> => {
  const clientAppSetupFiles =
    await app.pluginManager.hooks.clientAppSetupFiles.process(app);

  // Flat the hook result to get the file paths array.
  const filePaths = clientAppSetupFiles.flat();

  const content = `\
${filePaths
  .map((filePath, index) => `import clientAppSetup${index} from '${filePath}'`)
  .join('\n')}

export const clientAppSetups = [
${filePaths.map((_, index) => `  clientAppSetup${index},`).join('\n')}
]
`;

  await app.dirs.tmp.write('internal/clientAppSetups.js', content);
};
