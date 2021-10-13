import { isLinkHttp } from '@vitebook/core/node';
import { fs, path } from '@vitebook/core/node/utils';

const FAKE_HOST = 'https://a.com';

export function getIdName(id: string): string {
  let name = fs.existsSync(id)
    ? path.basename(id)
    : path.basename(
        new URL(isLinkHttp(id) ? id : `${FAKE_HOST}${id}`).pathname
      );
  name = path.trimExt(name);
  name = name.charAt(0).toUpperCase() + name.slice(1);
  return name;
}
