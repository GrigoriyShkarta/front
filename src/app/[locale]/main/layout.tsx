import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';
import { UserInitializer } from '@/components/common/user-initializer';
import { Sidebar } from '@/components/common/sidebar';
import { Header } from '@/components/common/header';
import { DynamicThemeProvider } from '@/context/dynamic-theme-provider';
import { StreamVideoProvider } from '@/providers/stream-video-provider';
import { ActiveCallProvider } from '@/context/active-call-context';
import { FloatingCallWrapper } from '@/components/layout/lesson-call/floating-call-wrapper';
import { GlobalLessonTimer } from '@/components/layout/lesson-call/components/global-lesson-timer';
import { LessonReminder } from '@/components/common/lesson-reminder';

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
        <StreamVideoProvider>
          <ActiveCallProvider>
            <div className="flex flex-col md:flex-row min-h-screen transition-colors duration-500 h-screen overflow-y-auto">
              <Sidebar />
              <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
                <Header />
                {children}
              </main>
            </div>
            <FloatingCallWrapper />
            <GlobalLessonTimer />
            <LessonReminder />
          </ActiveCallProvider>
        </StreamVideoProvider>
      </DynamicThemeProvider>
    </NextIntlClientProvider>
  );
}
