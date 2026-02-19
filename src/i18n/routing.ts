import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
import {LANGUAGES, DEFAULT_LANGUAGE} from '@/lib/constants';

export const routing = defineRouting({
  locales: LANGUAGES,
  defaultLocale: DEFAULT_LANGUAGE
});

export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);
