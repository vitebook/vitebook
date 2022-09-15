export const STATIC_DATA_ASSET_BASE_PATH = '/_immutable/data';

export function resolveStaticDataAssetId(id: string, pathname: string) {
  return `id=${id}&path=${pathname}`;
}
