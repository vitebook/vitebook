// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ThemeConfig = Record<string, any>;

// `Component` is defined by client plugin.
export type Theme<Component = unknown> = {
  Layout: Component;
  NotFound?: Component;
};
