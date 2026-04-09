import Cookies from 'js-cookie';

export const setAuthCookies = (access_token: string, refresh_token: string) => {
  const is_production = process.env.NODE_ENV === 'production';
  
  // Try to determine root domain for subdomains compatibility (e.g. .lirnexa.com)
  let domain = undefined;
  if (is_production && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        domain = '.' + parts.slice(-2).join('.');
      }
    }
  }
  
  Cookies.set('access_token', access_token, { 
    expires: 1, 
    secure: is_production, 
    sameSite: is_production ? 'none' : 'lax', 
    path: '/',
    domain
  });
  Cookies.set('refresh_token', refresh_token, { 
    expires: 7, 
    secure: is_production, 
    sameSite: is_production ? 'none' : 'lax', 
    path: '/',
    domain
  });
};


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
  
  // Also try without domain just in case
  Cookies.remove('access_token', { path: '/' });
  Cookies.remove('refresh_token', { path: '/' });
  Cookies.remove('has_token', { path: '/' });
};

export const getAccessToken = () => {
  return Cookies.get('access_token');
};
