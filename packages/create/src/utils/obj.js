// @ts-check

export function sortObjectKeys(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((o, key) => {
      o[key] = obj[key];
      return o;
    }, {});
}
