import { StoragePage } from '@/components/layout/storage/storage-page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cloud Storage | Lirnexa',
  description: 'Manage your cloud storage and view detailed statistics.',
};

export default function Page() {
  return <StoragePage />;
}
