import Cookies from 'js-cookie';

export const setAuthCookies = (access_token: string, refresh_token: string) => {
  const is_production = process.env.NODE_ENV === 'production';
  
  Cookies.set('access_token', access_token, { 
    expires: 1, 
    secure: is_production, 
    sameSite: 'lax', 
    path: '/' 
  });
  Cookies.set('refresh_token', refresh_token, { 
    expires: 7, 
    secure: is_production, 
    sameSite: 'lax', 
    path: '/' 
  });
};

export const clearAuthCookies = () => {
  Cookies.remove('access_token', { path: '/' });
  Cookies.remove('refresh_token', { path: '/' });
  
  // Also try without path just in case they were set without it
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
};

export const getAccessToken = () => {
  return Cookies.get('access_token');
};
