export interface GoogleSuccessResponse {
  access_token: string;
  auth_user: string;
  expires_in: string;
  hd: string;
  id_token: string;
  prompt: string;
  scope: string;
  token_type: string;
  version_info: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
  hd: string;
}
