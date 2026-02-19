/**
 * React Query Keys
 * Centralized place for all query keys to avoid duplication and typos
 */

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  
  // Space/Personalization
  space: {
    all: ['space'] as const,
    details: () => [...queryKeys.space.all, 'details'] as const,
  },

  // Materials
  materials: {
    all: ['materials'] as const,
    audio: {
      all: () => [...queryKeys.materials.all, 'audio'] as const,
      list: (filters?: any) => [...queryKeys.materials.audio.all(), 'list', filters] as const,
      detail: (id: string) => [...queryKeys.materials.audio.all(), 'detail', id] as const,
    },
    images: {
      all: () => [...queryKeys.materials.all, 'images'] as const,
      list: (filters?: any) => [...queryKeys.materials.images.all(), 'list', filters] as const,
      detail: (id: string) => [...queryKeys.materials.images.all(), 'detail', id] as const,
    },
    videos: {
      all: () => [...queryKeys.materials.all, 'videos'] as const,
      list: (filters?: any) => [...queryKeys.materials.videos.all(), 'list', filters] as const,
      detail: (id: string) => [...queryKeys.materials.videos.all(), 'detail', id] as const,
    },
    files: {
      all: () => [...queryKeys.materials.all, 'files'] as const,
      list: (filters?: any) => [...queryKeys.materials.files.all(), 'list', filters] as const,
      detail: (id: string) => [...queryKeys.materials.files.all(), 'detail', id] as const,
    },
  },
} as const;
