import type { ApplicationState } from './app';

export interface LocalStorageMetadata {
  userId?: string;
  manifest_version: string;
  upcoming_version?: string;
  user: any;
  settings: ApplicationState | undefined;
  extension_version: string;
  last_installed_version: string;
  first_installed_version: string;
  db_version: number;
}