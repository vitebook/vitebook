import { type BuildAdapterFactory } from '../build/adapter';

export type ResolvedBuildConfig = {
  adapter: BuildAdapterFactory;
};

export type BuildConfig = Partial<ResolvedBuildConfig>;
