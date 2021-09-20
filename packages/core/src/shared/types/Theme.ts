// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ThemeConfig = Record<string, any>;

// `Component` and `EnhanceAppCtx` are defined by client plugin.
export type Theme<Component = unknown, ConfigureClientAppContext = unknown> = {
  Layout: Component;
  NotFound?: Component;
  configureClientApp?: (ctx: ConfigureClientAppContext) => void | Promise<void>;
};

export type VirtualThemeModule<
  Component = unknown,
  ConfigureAppContext = unknown
> = {
  default: Theme<Component, ConfigureAppContext>;
};
