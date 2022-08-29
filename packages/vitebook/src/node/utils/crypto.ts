import { createHash } from 'node:crypto';

export function hash(content: string) {
  return createHash('sha1').update(content).digest('hex').substring(0, 8);
}
