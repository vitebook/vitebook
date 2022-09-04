async function interop<T>(loader: () => Promise<T>, specifier: keyof T) {
  const mod = await loader();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mod[specifier] ?? (mod as any).default[specifier];
}

const globals = {
  crypto: () => import('node:crypto'),
  URLPattern: () => interop(() => import('urlpattern-polyfill'), 'URLPattern'),
  Headers: () => interop(() => import('undici'), 'Headers'),
  ReadableStream: () =>
    interop(() => import('node:stream/web'), 'ReadableStream'),
  TransformStream: () =>
    interop(() => import('node:stream/web'), 'TransformStream'),
  WritableStream: () =>
    interop(() => import('node:stream/web'), 'WritableStream'),
  Request: async () => {
    const Readable = await interop(() => import('node:stream'), 'Readable');
    const Request = await interop(() => import('undici'), 'Request');
    const NodeFetchRequest = await interop(
      () => import('node-fetch'),
      'Request',
    );
    // TODO: remove the superclass as soon as Undici supports formData (https://github.com/nodejs/undici/issues/974)
    return class extends Request {
      formData() {
        return new NodeFetchRequest(this.url, {
          method: this.method,
          headers: this.headers,
          body: this.body && Readable.from(this.body),
        }).formData();
      }
    };
  },
  Response: () => interop(() => import('undici'), 'Response'),
  fetch: () => interop(() => import('undici'), 'fetch'),
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
