import { Storage } from "@plasmohq/storage"

class StorageService {
  private storage: Storage

  constructor() {
    this.storage = new Storage()
  }

  async get(key: string): Promise<any> {
    return await this.storage.get(key)
  }

  async set(key: string, value: any): Promise<void> {
    await this.storage.set(key, value)
  }

  async remove(key: string): Promise<void> {
    await this.storage.remove(key)
  }

  async clear(): Promise<void> {
    await this.storage.clear()
  }
}

export const storage = new StorageService() 