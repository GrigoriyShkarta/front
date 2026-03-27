import { IconType } from 'react-icons';
import { IoHomeOutline, IoPeopleOutline, IoBookOutline, IoMusicalNotesOutline, IoImageOutline, IoVideocamOutline, IoDocumentOutline, IoPricetagOutline, IoLibraryOutline, IoCheckmarkDoneOutline, IoSchoolOutline, IoWalletOutline, IoCardOutline, IoPersonOutline, IoCalendarOutline } from 'react-icons/io5';
import { FaPaintbrush } from 'react-icons/fa6';
import { FaChalkboard } from "react-icons/fa";

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
    label: 'users',
    href: '/main/users',
    icon: IoPeopleOutline,
    roles: ['super_admin', 'admin', 'teacher'],
  },
  {
    label: 'profile',
    href: '/main/profile',
    icon: IoPersonOutline,
    roles: ['student'],
  },
  {
    label: 'calendar',
    href: '/main/calendar',
    icon: IoCalendarOutline,
    roles: ['super_admin', 'admin', 'teacher', 'student'],
  },
  {
    label: 'lesson_recordings',
    href: '/main/profile/recordings',
    icon: IoVideocamOutline,
    roles: ['student'],
  },
  {
    label: 'tracker',
    href: '/main/tracker',
    icon: IoCheckmarkDoneOutline,
    roles: ['super_admin', 'admin', 'teacher', 'student'],
  },
  {
    label: 'boards',
    href: '/main/boards',
    icon: FaChalkboard,
    roles: ['super_admin', 'admin', 'teacher', 'student'],
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
    roles: ['super_admin', 'admin', 'teacher', 'student'],
    items: [
      {
        label: 'audio',
        href: '/main/materials/audio',
        icon: IoMusicalNotesOutline,
        roles: ['super_admin', 'admin', 'teacher', 'student'],
      },
      {
        label: 'photo',
        href: '/main/materials/photo',
        icon: IoImageOutline,
        roles: ['super_admin', 'admin', 'teacher', 'student'],
      },
      {
        label: 'video',
        href: '/main/materials/video',
        icon: IoVideocamOutline,
        roles: ['super_admin', 'admin', 'teacher', 'student'],
      },
      {
        label: 'file',
        href: '/main/materials/file',
        icon: IoDocumentOutline,
        roles: ['super_admin', 'admin', 'teacher', 'student'],
      },
      {
        label: 'lessons',
        href: '/main/materials/lessons',
        icon: IoBookOutline,
        roles: ['super_admin', 'admin', 'teacher', 'student'],
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
      },
      {
        label: 'reports',
        href: '/main/finance/reports',
        icon: IoDocumentOutline,
        roles: ['super_admin', 'admin'],
      }
    ]
  }
];
