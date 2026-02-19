'use client';

import { Modal, AspectRatio, Box, LoadingOverlay, rem } from '@mantine/core';
import { VideoMaterial } from '../schemas/video-schema';
import { useState, useEffect } from 'react';

interface Props {
  opened: boolean;
  onClose: () => void;
  video: VideoMaterial | null;
}

export function VideoPlayerModal({ opened, onClose, video }: Props) {
  const [is_loading, setIsLoading] = useState(true);

  const get_youtube_id = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const youtube_id = !video?.file_key && video?.file_url ? get_youtube_id(video.file_url) : null;

  useEffect(() => {
    if (opened) {
      setIsLoading(true);
      // Safety timeout: if video takes too long to load, hide overlay anyway
      const timer = setTimeout(() => setIsLoading(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [opened, video?.id]);

  if (!video) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={video.name}
      size="70%"
      centered
      padding={0}
      overlayProps={{
        backgroundOpacity: 0.8,
        blur: 10,
        color: '#000'
      }}
      styles={{
        header: { 
            backgroundColor: 'transparent', 
            border: 0,
            position: 'absolute',
            top: rem(-45),
            right: 0,
            width: '100%',
            color: 'white'
        },
        title: { fontWeight: 600 },
        close: { 
            color: 'white', 
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } 
        },
        content: { 
            backgroundColor: 'transparent', 
            boxShadow: 'none',
            overflow: 'visible'
        },
        body: { padding: 0 }
      }}
      className="video-player-modal"
    >
      <Box key={video.id} pos="relative" className="rounded-xl overflow-hidden shadow-2xl bg-black">
        <LoadingOverlay 
            visible={is_loading} 
            overlayProps={{ blur: 1, backgroundOpacity: 0.2 }} 
            loaderProps={{ color: 'blue' }}
        />
        <AspectRatio ratio={16 / 9}>
          {youtube_id ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtube_id}`}
              title={video.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              style={{ border: 0, width: '100%', height: '100%' }}
            />
          ) : (
            <video
              src={video.file_url || ''}
              controls
              autoPlay
              onCanPlay={() => setIsLoading(false)}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </AspectRatio>
      </Box>
    </Modal>
  );
}
