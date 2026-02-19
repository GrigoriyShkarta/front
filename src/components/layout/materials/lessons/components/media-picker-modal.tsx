import { Modal, Tabs, Button, Group, Box, Text, Stack, SegmentedControl, LoadingOverlay, TextInput } from '@mantine/core';
import { IoImageOutline, IoVideocamOutline, IoMusicalNotesOutline, IoDocumentOutline, IoCloudUploadOutline, IoLogoYoutube } from 'react-icons/io5';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';

// MIME Types not exported by default
const VIDEO_MIME_TYPE = ['video/mp4', 'video/webm', 'video/ogg'];
const AUDIO_MIME_TYPE = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'];

// Reusing existing hooks and tables
import { usePhotos } from '../../photos/hooks/use-photos';
import { PhotoTable } from '../../photos/components/photo-table';
import { useVideos } from '../../videos/hooks/use-videos';
import { VideoTable } from '../../videos/components/video-table';
import { useAudios } from '../../audios/hooks/use-audios';
import { AudioTable } from '../../audios/components/audio-table';
import { useFiles } from '../../files/hooks/use-files';
import { FileTable } from '../../files/components/file-table';

interface Props {
  opened: boolean;
  onClose: () => void;
  onSelect: (item: { id: string; url: string; name: string; type: 'image' | 'video' | 'audio' | 'file' }) => void;
  type?: 'image' | 'video' | 'audio' | 'file' | 'all';
}

export function MediaPickerModal({ opened, onClose, onSelect, type = 'all' }: Props) {
  const t = useTranslations('Materials');
  const tEditor = useTranslations('Materials.lessons.editor');
  const common_t = useTranslations('Common');
  const [activeTab, setActiveTab] = useState<string | null>(type === 'all' ? 'image' : type);
  const [mode, setMode] = useState<string>('library');
  
  // New states for name editing
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeName, setYoutubeName] = useState('');

  // Sync tab when type changes or modal opens
  useEffect(() => {
    if (opened) {
      setActiveTab(type === 'all' ? 'image' : type);
      setMode('library');
      setYoutubeUrl('');
      setYoutubeName('');
      setPendingFile(null);
      setFileName('');
    }
  }, [type, opened]);

  // Data for each type
  const photos = usePhotos({ page: 1, limit: 50, search: '' });
  const videos = useVideos({ page: 1, limit: 50, search: '' });
  const audios = useAudios({ page: 1, limit: 50, search: '' });
  const files = useFiles({ page: 1, limit: 50, search: '' });

  const on_file_select = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setPendingFile(file);
      setFileName(file.name.replace(/\.[^/.]+$/, "")); // Set initial name from filename
    }
  };

  const handle_upload = async (upload_fn: any, media_type: any, refetch_fn: any) => {
    if (!pendingFile || !fileName) return;
    try {
      await upload_fn({ name: fileName, file: pendingFile });
      
      notifications.show({
        title: common_t('success'),
        message: t(`${media_type === 'image' ? 'photo' : media_type}.notifications.upload_success`),
        color: 'green',
      });

      // Reset states and switch
      setPendingFile(null);
      setFileName('');
      if (refetch_fn) await refetch_fn();
      setMode('library');
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handle_youtube_submit = async () => {
    if (!youtubeUrl || !youtubeName) return;
    
    const youtube_regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = youtubeUrl.match(youtube_regex);
    
    if (!match) {
        notifications.show({
            title: common_t('error'),
            message: t('video.errors.invalid_youtube'),
            color: 'red',
        });
        return;
    }

    try {
        await videos.create_video({
            name: youtubeName,
            youtube_url: youtubeUrl
        });

        notifications.show({
            title: common_t('success'),
            message: t('video.notifications.upload_success'),
            color: 'green',
        });

        setYoutubeUrl('');
        setYoutubeName('');
        await videos.refetch();
        setMode('library');
    } catch (error) {
        console.error("YouTube add error:", error);
    }
  };

  const render_upload_area = (upload_fn: any, mime_types: any, media_type: any, is_uploading: boolean, refetch_fn: any) => (
    <Box mt="md" pos="relative">
      <LoadingOverlay visible={is_uploading} overlayProps={{ blur: 1 }} />
      
      {!pendingFile ? (
        <Dropzone
            onDrop={on_file_select}
            accept={mime_types}
            maxSize={100 * 1024 ** 2}
            radius="md"
        >
            <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                    <IoCloudUploadOutline size={52} color="var(--mantine-color-blue-6)" />
                </Dropzone.Accept>
                <Dropzone.Reject>
                    <IoCloudUploadOutline size={52} color="var(--mantine-color-red-6)" />
                </Dropzone.Reject>
                <Dropzone.Idle>
                    <IoCloudUploadOutline size={52} color="var(--mantine-color-dimmed)" />
                </Dropzone.Idle>

                <Stack gap={0} align="center">
                    <Text size="xl" inline fw={600}>
                    {tEditor('upload')}
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                    {t('photo.form.drop_hint')}
                    </Text>
                </Stack>
            </Group>
        </Dropzone>
      ) : (
        <Stack gap="md">
            <TextInput 
                label={t(`${media_type === 'image' ? 'photo' : media_type}.form.name`)}
                placeholder={t(`${media_type === 'image' ? 'photo' : media_type}.form.name_placeholder`)}
                value={fileName}
                onChange={(e) => setFileName(e.currentTarget.value)}
                required
            />
            <Text size="xs" c="dimmed">
                {pendingFile.name} ({(pendingFile.size / 1024 / 1024).toFixed(2)} MB)
            </Text>
            <Group grow>
                <Button variant="light" color="gray" onClick={() => { setPendingFile(null); setFileName(''); }}>
                    {common_t('cancel')}
                </Button>
                <Button onClick={() => handle_upload(upload_fn, media_type, refetch_fn)} disabled={!fileName}>
                    {tEditor('upload')}
                </Button>
            </Group>
        </Stack>
      )}
    </Box>
  );

  const render_youtube_area = () => (
    <Box mt="md">
        <Stack gap="md">
            <TextInput 
                label={t('video.form.name')}
                placeholder={t('video.form.name_placeholder')}
                value={youtubeName}
                onChange={(e) => setYoutubeName(e.currentTarget.value)}
                required
            />
            <TextInput 
                label={t('video.form.add_youtube')}
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.currentTarget.value)}
                leftSection={<IoLogoYoutube color="#FF0000" />}
                required
            />
            <Button 
                onClick={handle_youtube_submit} 
                loading={videos.is_uploading}
                disabled={!youtubeUrl || !youtubeName}
                fullWidth
            >
                {common_t('save')}
            </Button>
        </Stack>
    </Box>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('file.add_file')}
      size="xl"
      radius="md"
      styles={{
        header: { backgroundColor: 'var(--mantine-color-body)' },
        content: { backgroundColor: 'var(--mantine-color-body)', minHeight: '600px' }
      }}
    >
      <Tabs value={activeTab} onChange={(val) => { setActiveTab(val); setMode('library'); setPendingFile(null); setFileName(''); }} variant="outline">
        <Tabs.List mb="md">
          {(type === 'all' || type === 'image') && (
            <Tabs.Tab value="image" leftSection={<IoImageOutline size={16} />}>
              {t('photo.title')}
            </Tabs.Tab>
          )}
          {(type === 'all' || type === 'video') && (
            <Tabs.Tab value="video" leftSection={<IoVideocamOutline size={16} />}>
              {t('video.title')}
            </Tabs.Tab>
          )}
          {(type === 'all' || type === 'audio') && (
            <Tabs.Tab value="audio" leftSection={<IoMusicalNotesOutline size={16} />}>
              {t('audio.title')}
            </Tabs.Tab>
          )}
          {(type === 'all' || type === 'file') && (
            <Tabs.Tab value="file" leftSection={<IoDocumentOutline size={16} />}>
              {t('file.title')}
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Box mb="md">
            <SegmentedControl 
                fullWidth 
                value={mode} 
                onChange={(m) => { setMode(m); setPendingFile(null); setFileName(''); }}
                data={[
                    { label: tEditor('library'), value: 'library' },
                    { label: tEditor('upload'), value: 'upload' },
                    ...(activeTab === 'video' ? [{ label: tEditor('youtube'), value: 'youtube' }] : [])
                ]}
            />
        </Box>

        <Box mih={400} pos="relative">
          <Tabs.Panel value="image">
            {mode === 'library' ? (
                <PhotoTable 
                    data={photos.photos} 
                    selected_ids={[]} 
                    on_selection_change={() => {}} 
                    on_edit={() => {}} 
                    on_delete={() => {}}
                    on_preview={() => {}}
                    on_select={(photo) => onSelect({ id: photo.id, url: photo.file_url || '', name: photo.name, type: 'image' })}
                    is_picker={true}
                />
            ) : render_upload_area(photos.upload_photo, IMAGE_MIME_TYPE, 'image', photos.is_uploading, photos.refetch)}
          </Tabs.Panel>

          <Tabs.Panel value="video">
            {mode === 'library' ? (
                <VideoTable 
                    data={videos.videos} 
                    selected_ids={[]} 
                    on_selection_change={() => {}} 
                    on_edit={() => {}} 
                    on_delete={() => {}}
                    on_play={() => {}}
                    on_select={(video) => onSelect({ id: video.id, url: video.youtube_url || video.file_url || '', name: video.name, type: 'video' })}
                    is_picker={true}
                />
            ) : mode === 'upload' ? render_upload_area(videos.create_video, VIDEO_MIME_TYPE, 'video', videos.is_uploading, videos.refetch)
              : render_youtube_area()}
          </Tabs.Panel>

          <Tabs.Panel value="audio">
            {mode === 'library' ? (
                <AudioTable 
                    data={audios.audios} 
                    selected_ids={[]} 
                    on_selection_change={() => {}} 
                    on_edit={() => {}} 
                    on_delete={() => {}}
                    on_select={(audio) => onSelect({ id: audio.id, url: audio.file_url || '', name: audio.name, type: 'audio' })}
                    is_picker={true}
                />
            ) : render_upload_area(audios.upload_audio, AUDIO_MIME_TYPE, 'audio', audios.is_uploading, audios.refetch)}
          </Tabs.Panel>

          <Tabs.Panel value="file">
            {mode === 'library' ? (
                <FileTable 
                    data={files.files} 
                    selected_ids={[]} 
                    on_selection_change={() => {}} 
                    on_edit={() => {}} 
                    on_delete={() => {}}
                    on_select={(file) => onSelect({ id: file.id, url: file.file_url || '', name: file.name, type: 'file' })}
                    is_picker={true}
                />
            ) : render_upload_area(files.create_file, undefined, 'file', files.is_uploading, (files as any).refetch)}
          </Tabs.Panel>
        </Box>
      </Tabs>
    </Modal>
  );
}
