import * as store from "svelte/store";

export function writable<T>(key: string, def?: T) {
  const v = localStorage.getItem(key);
  if (v) {
    try {
      def = JSON.parse(v);
    } catch (err) {
      console.log(`cannot restore ${key} from localStorage, will use default`);
    }
  }

  const w = store.writable<T>(def);
  w.subscribe((v) => {
    localStorage.setItem(key, JSON.stringify(v));
  });

  return w;
}
