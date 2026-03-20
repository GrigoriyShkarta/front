'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo, StreamTheme } from '@stream-io/video-react-sdk';
import { useAuth } from '@/hooks/use-auth';
import { LoadingOverlay, useComputedColorScheme } from '@mantine/core';
import { useLocale } from 'next-intl';
import { STREAM_I18N_UK, STREAM_I18N_EN } from '@/lib/stream-i18n';
import "@stream-io/video-react-sdk/dist/css/styles.css";

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY || '';

export function StreamVideoProvider({ children }: { children: ReactNode }) {
  const { user, is_loading } = useAuth();
  const color_scheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const locale = useLocale();
  const [client, setClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    if (is_loading || !user || !API_KEY) return;

    const stream_user: any = {
      id: user.id,
      name: user.name,
      image: user.avatar || undefined,
      type: 'authenticated',
    };

    const stream_token = (user as any).stream_token;

    if (!stream_token) {
      console.warn('Stream token is missing for user', user.id);
      return;
    }

    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: stream_user,
      token: stream_token,
    });

    setClient(client);

    return () => {
      client.disconnectUser();
      setClient(null);
    };
  }, [user, is_loading]);

  if (!client && !is_loading && user && API_KEY) {
    return <LoadingOverlay visible />;
  }

  if (!client) return <>{children}</>;

  return (
    <StreamVideo 
      client={client} 
      language={locale === 'uk' ? 'uk' : 'en'}
      translationsOverrides={{
        uk: STREAM_I18N_UK,
        en: STREAM_I18N_EN,
      }}
    >
      <StreamTheme as="main" className={color_scheme}>
        {children}
      </StreamTheme>
    </StreamVideo>
  );
}
