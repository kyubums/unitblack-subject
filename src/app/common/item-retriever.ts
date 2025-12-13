export class ItemRetriever<T, K extends keyof T> {
  private itemByKey: Map<T[K], T>;

  constructor(items: T[], identifier: K) {
    this.itemByKey = new Map(items.map((item) => [item[identifier], item]));
  }

  get(key: T[K]): T | undefined {
    return this.itemByKey.get(key);
  }

  hasKey(key: T[K]): boolean {
    return this.itemByKey.has(key);
  }
}

export function createItemRetriever<T, K extends keyof T>(
  items: T[],
  identifier: K,
): ItemRetriever<T, K> {
  return new ItemRetriever(items, identifier);
}
