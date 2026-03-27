'use client';

export interface PickerItem {
  id: string;
  name: string;
  file_url?: string | null;
  youtube_url?: string | null;
  thumbnail_url?: string | null;
  categories?: any[];
  updated_at?: string;
  created_at?: string;
  [key: string]: any;
}

export type MaterialType = 'photo' | 'video' | 'audio' | 'file';
