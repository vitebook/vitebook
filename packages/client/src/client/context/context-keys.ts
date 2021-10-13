export const SSR_CTX_KEY = Symbol(import.meta.env.DEV ? 'VITEBOOK_SSR' : '');

export const ROUTER_CTX_KEY = Symbol(
  import.meta.env.DEV ? 'VITEBOOK_ROUTER' : ''
);
