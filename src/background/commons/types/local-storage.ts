import type { ApplicationState } from './app';
import type { UserInfoInterface } from '~interfaces';

export interface LocalStorageMetadata {
  OAuthOriginTab: {
    tabId: number | undefined;
  };
  userUuid?: string;
  manifest_version: string;
  upcoming_version?: string;
  user: UserInfo;
  settings: ApplicationState | undefined;
  extension_version: string;
  last_installed_version: string;
  first_installed_version: string;
  db_version: number;
  // legacy state object
  state: (ApplicationState & { user: UserInfoInterface }) | undefined;
  has_upgraded: boolean;
}

export interface UserInfo {
  email: string;
  user_id: string;
  google_access_token: string;
  access_token: string;
  refresh_token: string;
  refresh_token_expires_in: number;
  token_expires_in: number;
  last_logged_in: Date;
  name: string;
}
