import Cookies from 'js-cookie';

export const clearAuthCookies = () => {
  let domain = undefined;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        domain = '.' + parts.slice(-2).join('.');
      }
    }
  }

  const options = { path: '/', domain };
  Cookies.remove('access_token', options);
  Cookies.remove('refresh_token', options);
  Cookies.remove('has_token', options);
  Cookies.remove('access_token_client', options);
  
  // Also try without domain just in case
  Cookies.remove('access_token', { path: '/' });
  Cookies.remove('refresh_token', { path: '/' });
  Cookies.remove('has_token', { path: '/' });
  Cookies.remove('access_token_client', { path: '/' });
};

export const getAccessToken = () => {
  return Cookies.get('access_token');
};
