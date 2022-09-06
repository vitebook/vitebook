import type { ServerFile } from 'server/types';

import { Files } from './Files';

const STATIC_LOADER_RE =
  /(export function staticLoader|export async function staticLoader|export (const|let) staticLoader)/;

const SERVER_LOADER_RE =
  /(export function serverLoader|export async function serverLoader|export (const|let) serverLoader)/;

const SERVER_ACTION_RE =
  /(export function serverAction|export async function serverAction|export (const|let) serverAction)/;

export abstract class LoadableFiles<T extends ServerFile> extends Files<T> {
  hasStaticLoader(fileContent: string) {
    return STATIC_LOADER_RE.test(fileContent);
  }

  hasServerLoader(fileContent: string) {
    return SERVER_LOADER_RE.test(fileContent);
  }

  hasServerAction(fileContent: string) {
    return SERVER_ACTION_RE.test(fileContent);
  }
}
