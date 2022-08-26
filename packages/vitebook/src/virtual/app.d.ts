declare module ':virtual/vitebook/app' {
  declare const app: {
    id: string;
    module: { [id: string]: unknown };
    baseUrl: string;
    configs: import('../client').ConfigureApp[];
  };

  export default app;
}
