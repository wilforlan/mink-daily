export interface BaseTokenPayload {
  id: string;
  iat: number;
  exp: number;
  iss: string;
}

export interface RefreshTokenPayload extends BaseTokenPayload {
  type: 'rf';
}

export type AccessToken = BaseTokenPayload;

export interface RefreshTokenSuccessResult {
  accessToken: string;
  expiresIn: number;
  message: string;
  refreshExpiresIn: number;
  refreshToken: string;
}
