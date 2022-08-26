import { webcrypto as crypto } from 'crypto';
import { Request as NodeFetchRequest } from 'node-fetch';
import { Readable } from 'stream';
import { ReadableStream, TransformStream, WritableStream } from 'stream/web';
import { fetch, Headers, Request, Response } from 'undici';
import { URLPattern } from 'urlpattern-polyfill';

/** @type {Record<string, any>} */
const globals = {
  URLPattern,
  crypto,
  fetch,
  Response,
  // TODO: remove the superclass as soon as Undici supports formData
  // https://github.com/nodejs/undici/issues/974
  Request: class extends Request {
    // @ts-expect-error - .
    formData() {
      return new NodeFetchRequest(this.url, {
        method: this.method,
        headers: this.headers,
        body: this.body && Readable.from(this.body),
      }).formData();
    }
  },
  Headers,
  ReadableStream,
  TransformStream,
  WritableStream,
};

export function installPolyfills() {
  for (const name in globals) {
    Object.defineProperty(globalThis, name, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: globals[name],
    });
  }
}
