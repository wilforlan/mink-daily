export interface Config {
  prod: string | number;
  staging: string | number;
}

export class ConfigStore<T extends { [key: string]: boolean | number | string | Config }> {
  constructor(private readonly configs: T) {}

  getEnv(): keyof Config {
    switch (process.env.NODE_ENV) {
      // @ts-ignore
      case 'staging':
      case 'development':
        return 'staging';
      case 'production':
      default:
        return 'prod';
    }
  }

  getConfig<K extends keyof T, V extends T[K]>(key: K): V extends Config ? string : V {
    const type = typeof this.configs[key];
    // for simple types directly return them
    if (['boolean', 'number', 'string'].indexOf(type) >= 0) {
      return this.configs[key] as any;
    }
    const env = this.getEnv();
    // @ts-ignore;
    return this.configs[key][env];
  }

  updateConfig<K extends keyof T, V extends T[K]>(key: K, value: V) {
    // @ts-ignore;
    return (this.configs[key] = value);
  }
}
