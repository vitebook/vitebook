import { path } from '../../../utils/path.js';
import type { App } from '../../App.js';

export const resolvePageComponentFileInfo = async ({
  app,
  htmlFilePathRelative
}: {
  app: App;
  htmlFilePathRelative: string;
}): Promise<{
  componentFilePath: string;
  componentFilePathRelative: string;
}> => {
  const componentFilePathRelative = path.join(
    'pages',
    `${htmlFilePathRelative}.vue`
  );

  const componentFilePath = app.dirs.temp.resolve(componentFilePathRelative);

  return {
    componentFilePath,
    componentFilePathRelative
  };
};
