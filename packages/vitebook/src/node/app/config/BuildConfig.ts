import type {
  AutoBuildAdapterConfig,
  BuildAdapterFactory,
} from '../build/adapter';

export type ResolvedBuildConfig = {
  adapter: BuildAdapterFactory | AutoBuildAdapterConfig;
};

export type BuildConfig = Partial<ResolvedBuildConfig>;
