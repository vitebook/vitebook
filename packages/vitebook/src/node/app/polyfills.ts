// TODO: Let's review what's actually required here for node@16+

const globals = {
  crypto: () => import('node:crypto'),
  URLPattern: async () => (await import('urlpattern-polyfill')).URLPattern,
  Headers: async () => (await import('undici')).Headers,
  ReadableStream: async () => (await import('node:stream/web')).ReadableStream,
  TransformStream: async () =>
    (await import('node:stream/web')).TransformStream,
  WritableStream: async () => (await import('node:stream/web')).WritableStream,
  Request: async () => {
    const { Readable } = await import('node:stream');
    const { Request } = await import('undici');
    const { Request: NodeFetchRequest } = await import('node-fetch');
    // TODO: remove the superclass as soon as Undici supports formData (https://github.com/nodejs/undici/issues/974)
    return class extends Request {
      // @ts-expect-error - .
      formData() {
        return new NodeFetchRequest(this.url, {
          method: this.method,
          headers: this.headers,
          body: this.body && Readable.from(this.body),
        }).formData();
      }
    };
  },
  Response: async () => (await import('undici')).Response,
  fetch: async () => (await import('undici')).fetch,
};

let installed = false;
export async function installPolyfills() {
  if (installed) return;

  for (const name in globals) {
    if (!(name in globalThis)) {
      Object.defineProperty(globalThis, name, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: await globals[name](),
      });
    }
  }

  installed = true;
}
