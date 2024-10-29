const isPreAlpha = false;
export const isProduction = !isPreAlpha && process.env.NODE_ENV === 'production';

export const SettingUrls = {
  TERMS: 'https://usemink.com/terms',
  PRIVACY: 'https://usemink.com/privacy',
};


export const EmailValidator =
  /* eslint-disable-next-line max-len */
  // eslint-disable-next-line no-useless-escape
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;



