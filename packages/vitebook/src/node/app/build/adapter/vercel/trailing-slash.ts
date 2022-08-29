// Rules for clean URLs and trailing slash handling - generated with @vercel/routing-utils.
// FROM: https://github.com/sveltejs/kit/blob/master/packages/adapter-vercel/index.js
export const trailingSlash = {
  keep: [
    {
      src: '^/(?:(.+)/)?index(?:\\.html)?/?$',
      headers: {
        Location: '/$1/',
      },
      status: 308,
    },
    {
      src: '^/(.*)\\.html/?$',
      headers: {
        Location: '/$1/',
      },
      status: 308,
    },
    {
      src: '^/\\.well-known(?:/.*)?$',
    },
    {
      src: '^/((?:[^/]+/)*[^/\\.]+)$',
      headers: {
        Location: '/$1/',
      },
      status: 308,
    },
    {
      src: '^/((?:[^/]+/)*[^/]+\\.\\w+)/$',
      headers: {
        Location: '/$1',
      },
      status: 308,
    },
  ],
  remove: [
    {
      src: '^/(?:(.+)/)?index(?:\\.html)?/?$',
      headers: {
        Location: '/$1',
      },
      status: 308,
    },
    {
      src: '^/(.*)\\.html/?$',
      headers: {
        Location: '/$1',
      },
      status: 308,
    },
    {
      src: '^/(.*)/$',
      headers: {
        Location: '/$1',
      },
      status: 308,
    },
  ],
};
