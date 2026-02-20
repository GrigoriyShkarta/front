import { IconType } from 'react-icons';
import { IoSettingsOutline, IoHomeOutline, IoPeopleOutline, IoBookOutline, IoMusicalNotesOutline, IoImageOutline, IoVideocamOutline, IoDocumentOutline, IoPricetagOutline, IoLibraryOutline, IoCheckmarkDoneOutline, IoSchoolOutline, IoWalletOutline, IoCardOutline, IoPersonOutline } from 'react-icons/io5';

export interface NavItem {
  label: string; // Translation key
  href: string;
  icon: IconType;
  roles: string[];
  items?: NavItem[];
}

export const MAIN_NAVIGATION: NavItem[] = [
  {
    label: 'dashboard',
    href: '/main',
    icon: IoHomeOutline,
    roles: ['super_admin', 'admin', 'teacher', 'student'],
  },
  {
    label: 'profile',
    href: '/main/profile',
    icon: IoPersonOutline,
    roles: ['student'],
  },
  {
    label: 'personalization',
    href: '/main/personalization',
    icon: IoSettingsOutline,
    roles: ['super_admin'],
  },
  {
    label: 'users',
    href: '/main/users',
    icon: IoPeopleOutline,
    roles: ['super_admin', 'admin', 'teacher'],
  },
  {
    label: 'categories',
    href: '/main/categories',
    icon: IoPricetagOutline,
    roles: ['super_admin', 'admin', 'teacher'],
  },
  {
    label: 'materials',
    href: '/main/materials',
    icon: IoLibraryOutline,
    roles: ['super_admin', 'admin', 'teacher'],
    items: [
      {
        label: 'audio',
        href: '/main/materials/audio',
        icon: IoMusicalNotesOutline,
        roles: ['super_admin', 'admin', 'teacher'],
      },
      {
        label: 'photo',
        href: '/main/materials/photo',
        icon: IoImageOutline,
        roles: ['super_admin', 'admin', 'teacher'],
      },
      {
        label: 'video',
        href: '/main/materials/video',
        icon: IoVideocamOutline,
        roles: ['super_admin', 'admin', 'teacher'],
      },
      {
        label: 'file',
        href: '/main/materials/file',
        icon: IoDocumentOutline,
        roles: ['super_admin', 'admin', 'teacher'],
      },
      {
        label: 'lessons',
        href: '/main/materials/lessons',
        icon: IoBookOutline,
        roles: ['super_admin', 'admin', 'teacher'],
      },
      {
        label: 'courses',
        href: '/main/materials/courses',
        icon: IoSchoolOutline,
        roles: ['super_admin', 'admin', 'teacher'],
      },
    ]
  },
  {
    label: 'finance',
    href: '/main/finance',
    icon: IoWalletOutline,
    roles: ['super_admin', 'admin'],
    items: [
      {
        label: 'subscriptions',
        href: '/main/finance/subscriptions',
        icon: IoCardOutline,
        roles: ['super_admin', 'admin'],
      }
    ]
  }
];
