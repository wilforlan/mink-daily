export function urlHashToObject<T>(hash: string): T {
  if (!hash.length) {
    return {} as T;
  }

  if (hash.startsWith('#')) {
    hash = hash.substring(1);
  }

  const obj = {};
  hash.split('&').map((entry) => {
    const [k, v] = entry.split('=');
    // @ts-ignore
    obj[k] = v;
  });

  return obj as T;
}
