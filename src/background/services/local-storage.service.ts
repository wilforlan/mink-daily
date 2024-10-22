import { Storage } from "@plasmohq/storage"

export class LocalStorageService<T> {
  private storage: Storage;
  constructor() {
    this.storage = new Storage();
  }

  public put(key: any, value: any) {
    return this.storage.set(key, JSON.stringify(value));
  }

  public async update(key: any, value: Partial<any>) {
    const current = (await this.get(key)) || {};
    const data = JSON.stringify({ ...current, ...value });
    return this.storage.set(key, data);
  }

  public get(key: any): Promise<any> {
    return new Promise((resolve) =>
      this.storage.get(key).then((item) => {
        if (item === undefined) {
          return resolve(undefined);
        }
        resolve(JSON.parse(item) as any);
      }),
    );
  }

  public async delete(key: any) {
    return this.storage.set(key, null);
  }
}

export default new LocalStorageService();
