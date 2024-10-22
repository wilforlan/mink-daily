export interface UserAuthResponse {
  expiresIn: number;
  message: string;
  refreshExpiresIn: number;
  refreshToken: string;
  status: boolean;
  token: string;
  userId: string;
  name: string;
}

export interface RemoteStorage {
  bucket: string;
  internal: boolean;
  prefix_url: string;
  provider: 'S3' | 'GCS';
  region: string;
}

export interface CreateMeetingResponse {
  meeting: string;
  status: boolean;
  storage: RemoteStorage;
}
