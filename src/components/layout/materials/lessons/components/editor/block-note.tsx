'use client';

import { BlockNoteView } from "@blocknote/mantine";
import * as locales from '@blocknote/core/locales';
import { 
  useCreateBlockNote, 
  getDefaultReactSlashMenuItems, 
  SuggestionMenuController,
  createReactBlockSpec,
  FormattingToolbarController,
  FormattingToolbar,
  TextAlignButton
} from "@blocknote/react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import "@blocknote/mantine/style.css";
import { 
  IoVideocamOutline, 
  IoImageOutline, 
  IoMusicalNotesOutline, 
  IoDocumentOutline, 
  IoMenuOutline,
  IoResizeOutline,
  IoDownloadOutline,
  IoFileTrayOutline
} from 'react-icons/io5';
import { useMemo, forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { ActionIcon, Group, Menu, Box, Paper, Text, Stack, Card } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useTranslations, useLocale } from 'next-intl';
import { MediaPickerModal } from '../media-picker-modal';
import { photoActions } from '../../../photos/actions/photo-actions';
import { videoActions } from '../../../videos/actions/video-actions';
import { audioActions } from '../../../audios/actions/audio-actions';
import { fileActions } from '../../../files/actions/file-actions';
import { AudioPlayer } from '@/components/ui/audio-player';
import { cn } from '@/lib/utils';
import { PhotoPreviewModal, PhotoMaterialPreview } from '@/components/common/photo-preview-modal';

/**
 * Custom YouTube block specification
 */
const YoutubeBlock = createReactBlockSpec(
  {
    type: "youtube",
    propSchema: {
      id: { default: "" },
      url: { default: "" },
      videoId: { default: "" },
      alignment: { default: "center", values: ["left", "center", "right"] },
      width: { default: "85%", values: ["50%", "70%", "85%", "100%"] },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const videoId = block.props.videoId || "";
      const url = videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : block.props.url;
      const { alignment, width } = block.props;
      const is_read_only = !editor.isEditable;
      const justify = alignment === 'left' ? 'flex-start' : (alignment === 'right' ? 'flex-end' : 'center');

      return (
        <Box className="w-full relative group py-4" style={{ display: 'flex', justifyContent: justify }}>
          <Box 
            className="aspect-video relative overflow-hidden rounded-xl shadow-lg border border-white/10"
            style={{ width: width }}
          >
            <iframe
              src={url}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            
            {!is_read_only && (
              <Box className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Paper 
                  withBorder 
                  shadow="sm" 
                  radius="md" 
                  p={4} 
                  className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md"
                >
                  <Group gap={4}>
                    <Menu shadow="md">
                      <Menu.Target>
                        <ActionIcon variant="subtle" size="sm" color="gray">
                          <IoMenuOutline size={14} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item onClick={() => editor.updateBlock(block, { props: { alignment: 'left' } })}>Left</Menu.Item>
                        <Menu.Item onClick={() => editor.updateBlock(block, { props: { alignment: 'center' } })}>Center</Menu.Item>
                        <Menu.Item onClick={() => editor.updateBlock(block, { props: { alignment: 'right' } })}>Right</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>

                    <Menu shadow="md">
                      <Menu.Target>
                        <ActionIcon variant="subtle" size="sm" color="gray">
                          <IoResizeOutline size={14} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item onClick={() => editor.updateBlock(block, { props: { width: '50%' } })}>50%</Menu.Item>
                        <Menu.Item onClick={() => editor.updateBlock(block, { props: { width: '70%' } })}>70%</Menu.Item>
                        <Menu.Item onClick={() => editor.updateBlock(block, { props: { width: '85%' } })}>85%</Menu.Item>
                        <Menu.Item onClick={() => editor.updateBlock(block, { props: { width: '100%' } })}>Full Width</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      );
    },
  }
);


/**
 * Custom Audio block specification
 */
const AudioBlock = createReactBlockSpec(
  {
    type: "audio",
    propSchema: {
      id: { default: "" },
      url: { default: "" },
      name: { default: "Audio File" },
      alignment: { default: "center", values: ["left", "center", "right"] },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const { alignment, url } = block.props;
      const is_read_only = !editor.isEditable;
      const justify = alignment === 'left' ? 'flex-start' : (alignment === 'right' ? 'flex-end' : 'center');

      return (
        <Box className="py-4 relative group w-full" style={{ display: 'flex', justifyContent: justify }}>
          <AudioPlayer src={url} class_name="" />
          
          {!is_read_only && (
            <Box className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Paper withBorder shadow="sm" radius="md" p={4} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
                <Menu shadow="md">
                  <Menu.Target>
                    <ActionIcon variant="subtle" size="sm" color="gray">
                      <IoMenuOutline size={14} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item onClick={() => editor.updateBlock(block, { props: { alignment: 'left' } })}>Left</Menu.Item>
                    <Menu.Item onClick={() => editor.updateBlock(block, { props: { alignment: 'center' } })}>Center</Menu.Item>
                    <Menu.Item onClick={() => editor.updateBlock(block, { props: { alignment: 'right' } })}>Right</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Paper>
            </Box>
          )}
        </Box>
      );
    }
  }
);

/**
 * Custom File block specification
 */
const FileBlock = createReactBlockSpec(
  {
    type: "file",
    propSchema: {
      id: { default: "" },
      url: { default: "" },
      name: { default: "Document" },
      extension: { default: "" },
      alignment: { default: "center", values: ["left", "center", "right"] },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const { url, name, alignment } = block.props;
      const extension = block.props.extension || url.split('.').pop()?.toUpperCase() || 'FILE';
      const justify = alignment === 'left' ? 'flex-start' : (alignment === 'right' ? 'flex-end' : 'center');
      const is_read_only = !editor.isEditable;

      return (
        <Box className="py-2 relative group w-full" style={{ display: 'flex', justifyContent: justify }}>
          <Card 
            component="a"
            href={url}
            target="_blank"
            download
            withBorder={!is_read_only} 
            radius="lg" 
            p="sm" 
            className={cn(
                "w-full max-w-md transition-all no-underline text-inherit",
                is_read_only 
                    ? "bg-transparent hover:bg-zinc-50 dark:hover:bg-white/5" 
                    : "bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800"
            )}
          >
            <Group wrap="nowrap" gap="md">
              <Box className="relative">
                <Box 
                  className="w-12 h-14 rounded-lg border flex items-center justify-center relative overflow-hidden text-white border-transparent"
                  bg="brand"
                >
                  <IoFileTrayOutline size={24} />
                </Box>
              </Box>
              
              <Stack gap={2} className="flex-1 min-w-0">
                <Text fw={600} size="sm" className="truncate">{name}</Text>
                <Text size="xs" c="dimmed">{extension} Document</Text>
              </Stack>

              {!is_read_only && (
                <ActionIcon 
                  variant="subtle" 
                  color="brand"
                  radius="md"
                >
                  <IoDownloadOutline size={20} />
                </ActionIcon>
              )}
            </Group>
          </Card>

          {!is_read_only && (
            <Box className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Paper withBorder shadow="sm" radius="md" p={4} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
                <Menu shadow="md">
                  <Menu.Target>
                    <ActionIcon variant="subtle" size="sm" color="gray">
                      <IoMenuOutline size={14} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item onClick={() => editor.updateBlock(block, { props: { alignment: 'left' } })}>Left</Menu.Item>
                    <Menu.Item onClick={() => editor.updateBlock(block, { props: { alignment: 'center' } })}>Center</Menu.Item>
                    <Menu.Item onClick={() => editor.updateBlock(block, { props: { alignment: 'right' } })}>Right</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Paper>
            </Box>
          )}
        </Box>
      )
    }
  }
);

// Create schema with the custom blocks

// Create schema with the custom blocks
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    youtube: YoutubeBlock(),
    audio: AudioBlock(),
    file: FileBlock(),
  },
});

export interface BlockNoteEditorRef {
  insert_media: (id: string, url: string, type: 'image' | 'video' | 'audio' | 'file') => void;
}

/**
 * Props for the BlockNoteEditor component
 * @param {string} initial_content - Initial editor content in JSON string format
 * @param {function} on_change - Callback fired when content changes
 * @param {function} on_open_bank - Callback to open the media bank modal
 */
interface Props {
  initial_content?: string;
  on_change: (content: string) => void;
  on_open_bank: (type: 'image' | 'video' | 'audio' | 'file') => void;
  read_only?: boolean;
}

const BlockNoteEditor = forwardRef<BlockNoteEditorRef, Props>(({ initial_content, on_change, on_open_bank, read_only = false }, ref) => {
  const { colorScheme } = useMantineColorScheme();
  const locale = useLocale();
  const t = useTranslations('Materials.lessons.editor');

  const [pickerOpened, setPickerOpened] = useState(false);
  const [pickerType, setPickerType] = useState<'image' | 'video' | 'audio' | 'file' | 'all'>('all');

  const [previewOpened, setPreviewOpened] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoMaterialPreview | null>(null);
  const [previewPhotosList, setPreviewPhotosList] = useState<PhotoMaterialPreview[]>([]);

  const editor = useCreateBlockNote({
    schema,
    initialContent: initial_content ? JSON.parse(initial_content) : undefined,
    dictionary: (locales as any)[locale] || locales.en,
    editable: !read_only,
    uploadFile: async (file: File) => {
      let result;
      if (file.type.startsWith('image/')) {
        result = await photoActions.create_photo({ name: file.name, file });
      } else if (file.type.startsWith('video/')) {
        result = await videoActions.create_video({ name: file.name, file });
      } else if (file.type.startsWith('audio/')) {
        result = await audioActions.create_audio({ name: file.name, file });
      } else {
        result = await fileActions.create_file({ name: file.name, file });
      }
      return (result as any)?.data?.file_url || (result as any)?.file_url || '';
    }
  });

  // Sync editor editability with read_only prop
  useEffect(() => {
    editor.isEditable = !read_only;
  }, [read_only, editor]);

  // Handle image clicks in read-only mode
  const handleWrapperClick = (e: React.MouseEvent) => {
    if (!read_only) return;

    const target = e.target as HTMLElement;
    const img = target.closest('img');
    
    if (img && img.closest('.bn-editor')) {
      const url = img.src;
      
      // Find all images for gallery in THIS editor
      const allImages: PhotoMaterialPreview[] = [];
      editor.forEachBlock((block) => {
        if (block.type === 'image' && block.props.url) {
          allImages.push({
            id: block.id,
            name: (block.props as any).name || 'Image',
            file_url: block.props.url
          });
        }
        return true;
      });

      const currentPhoto = allImages.find(p => p.file_url === url) || {
        id: Math.random().toString(),
        name: 'Image',
        file_url: url
      };

      setPreviewPhoto(currentPhoto);
      setPreviewPhotosList(allImages);
      setPreviewOpened(true);
    }
  };

  const open_picker = (type: 'image' | 'video' | 'audio' | 'file') => {
    setPickerType(type);
    setPickerOpened(true);
  };

  const handle_selection = (item: { id: string; url: string; name: string; type: 'image' | 'video' | 'audio' | 'file' }) => {
    const selection = editor.getTextCursorPosition();
    const current_block = selection?.block;

    // Determine block type and props
    let block_type: any = item.type;
    let props: any = { id: item.id, url: item.url, name: item.name };

    if (item.type === 'video') {
      const youtube_regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = item.url.match(youtube_regex);
      if (match && match[1]) {
        block_type = "youtube";
        props = {
          url: `https://www.youtube.com/embed/${match[1]}`,
          videoId: match[1]
        };
      }
    }

    if (item.type === 'file') {
        const ext = item.url.split('.').pop() || '';
        props.extension = ext.toUpperCase();
    }

    editor.insertBlocks(
      [{ type: block_type, props: props }],
      current_block || editor.document[editor.document.length - 1],
      "after"
    );
    setPickerOpened(false);
  };

  useImperativeHandle(ref, () => ({
    insert_media: (id: string, url: string, type: 'image' | 'video' | 'audio' | 'file') => {
      handle_selection({ id, url, name: '', type });
    }
  }));

  const custom_slash_items = useMemo(() => {
    // List of titles to filter out (native media items)
    const native_media_titles = [
      editor.dictionary.slash_menu.image.title,
      editor.dictionary.slash_menu.video.title,
      editor.dictionary.slash_menu.audio.title,
      editor.dictionary.slash_menu.file.title,
      "Image", "Video", "Audio", "File", "Media"
    ];

    const base_items = getDefaultReactSlashMenuItems(editor).filter(item => 
      !native_media_titles.includes(item.title)
    );
    
    const bank_items = [
      {
        title: t('photo_from_bank'),
        subtext: t('photo_from_bank_subtext'),
        onItemClick: () => open_picker('image'),
        group: t('library'),
        icon: <IoImageOutline size={18} />,
      },
      {
        title: t('video_from_bank'),
        subtext: t('video_from_bank_subtext'),
        onItemClick: () => open_picker('video'),
        group: t('library'),
        icon: <IoVideocamOutline size={18} />,
      },
      {
        title: t('audio_from_bank'),
        subtext: t('audio_from_bank_subtext'),
        onItemClick: () => open_picker('audio'),
        group: t('library'),
        icon: <IoMusicalNotesOutline size={18} />,
      },
      {
        title: t('file_from_bank'),
        subtext: t('file_from_bank_subtext'),
        onItemClick: () => open_picker('file'),
        group: t('library'),
        icon: <IoDocumentOutline size={18} />,
      },
    ];

    return [...bank_items, ...base_items];
  }, [editor, t]);

  return (
    <div 
      className={`block-note-wrapper ${read_only ? 'is-read-only' : ''}`}
      onClick={handleWrapperClick}
    >
      <BlockNoteView
        editor={editor}
        theme={colorScheme === 'dark' ? 'dark' : 'light'}
        onChange={() => on_change(JSON.stringify(editor.document, null, 2))}
        slashMenu={false}
        formattingToolbar={false}
        data-test="block-note-editor"
      >
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <TextAlignButton textAlignment="left" />
              <TextAlignButton textAlignment="center" />
              <TextAlignButton textAlignment="right" />
            </FormattingToolbar>
          )}
        />
        <SuggestionMenuController
          triggerCharacter={'/'}
          getItems={async (query) =>
            custom_slash_items.filter((item: any) =>
              item.title.toLowerCase().includes(query.toLowerCase())
            )
          }
        />
      </BlockNoteView>

      <MediaPickerModal
        opened={pickerOpened}
        onClose={() => setPickerOpened(false)}
        onSelect={handle_selection}
        type={pickerType}
      />

      <PhotoPreviewModal
        opened={previewOpened}
        onClose={() => setPreviewOpened(false)}
        photo={previewPhoto}
        photos={previewPhotosList}
        onPhotoChange={setPreviewPhoto}
      />

      <style jsx global>{`
        /* Keep only alignment handlers */
        .block-note-wrapper.is-read-only .bn-visual-editor {
          cursor: default;
        }
        .block-note-wrapper.is-read-only .bn-editor img {
          cursor: pointer;
        }
        .bn-file-block-content-wrapper {
          outline: none !important;
        }
      `}</style>
    </div>
  );
});

BlockNoteEditor.displayName = 'BlockNoteEditor';

export default BlockNoteEditor;
