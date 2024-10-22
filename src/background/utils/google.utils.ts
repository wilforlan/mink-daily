export function getGoogleUserInfoURL(token: string) {
  return `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`;
}

export function getGoogleOauthURL(redirectUri: string, clientId: string, scopes: string) {
  return (
    'https://accounts.google.com/o/oauth2/v2/auth?prompt=consent' +
    `&client_id=${clientId}` +
    '&response_type=id_token%20token&access_type=online&nonce=uisjd8dj' +
    `&redirect_uri=${redirectUri}` +
    `&scope=${scopes}`
  );
}
