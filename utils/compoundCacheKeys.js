const keyCache = new WeakMap();

export default function combine(...keys) {
  let cache = keyCache;

  for (const key of keys) {
    if (!cache.has(key)) {
      cache.set(key, new WeakMap());
    }
    cache = cache.get(key);
  }

  return cache;
}
