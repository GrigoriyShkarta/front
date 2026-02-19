import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';
import { UserInitializer } from '@/components/common/user-initializer';
import { Sidebar } from '@/components/common/sidebar';
import { DynamicThemeProvider } from '@/context/dynamic-theme-provider';

export default async function MainLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <UserInitializer />
      <DynamicThemeProvider>
        <div className="flex flex-col md:flex-row min-h-screen transition-colors duration-500 h-screen overflow-y-auto">
          <Sidebar />
          <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
            {children}
          </main>
        </div>
      </DynamicThemeProvider>
    </NextIntlClientProvider>
  );
}
