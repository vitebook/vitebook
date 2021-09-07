// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ThemeConfig = Record<string, any>;

// `Component` and `EnhanceAppCtx` are defined by client plugin.
export type Theme<Component = unknown, ConfigureAppContext = unknown> = {
  Layout: Component;
  NotFound?: Component;
  configureApp?: (ctx: ConfigureAppContext) => void | Promise<void>;
};

export type VirtualThemeModule<
  Component = unknown,
  ConfigureAppContext = unknown
> = {
  default: Theme<Component, ConfigureAppContext>;
};
