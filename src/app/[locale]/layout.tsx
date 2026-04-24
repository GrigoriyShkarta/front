import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { MantineProvider } from "@mantine/core";
import { AuthProvider } from '@/context/auth-context';
import { theme } from "@/styles/mantine-theme";
import "@/styles/globals.css";
import { Notifications } from '@mantine/notifications';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/dates/styles.css';
import { ReactQueryProvider } from '@/context/query-provider';
import { SpaceMetadataInitializer } from '@/components/common/space-metadata-initializer';
import { PaymentReminder } from '@/components/common/payment-reminder';

import { StreamVideoProvider } from '@/providers/stream-video-provider';
import { FloatingNotesProvider } from '@/context/floating-notes-context';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ReactQueryProvider>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Notifications position="top-center" />
          <AuthProvider>
            <FloatingNotesProvider>
              <StreamVideoProvider>
                <SpaceMetadataInitializer />
                {children}
                <PaymentReminder />
              </StreamVideoProvider>
            </FloatingNotesProvider>
          </AuthProvider>
        </MantineProvider>
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
}

