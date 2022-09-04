import type {
  AutoBuildAdapterConfig,
  BuildAdapterFactory,
} from 'node/build/adapter';

export type ResolvedBuildConfig = {
  adapter: BuildAdapterFactory | AutoBuildAdapterConfig;
};

export type BuildConfig = Partial<ResolvedBuildConfig>;
