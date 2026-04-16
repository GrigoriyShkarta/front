'use client';

import { BlockNoteView } from "@blocknote/mantine";
import * as locales from '@blocknote/core/locales';
import { useCreateBlockNote, getDefaultReactSlashMenuItems, SuggestionMenuController, FormattingToolbarController, FormattingToolbar, TextAlignButton, BasicTextStyleButton, ColorStyleButton, BlockTypeSelect, CreateLinkButton, NestBlockButton, UnnestBlockButton } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { IoVideocamOutline, IoImageOutline, IoMusicalNotesOutline, IoDocumentOutline } from 'react-icons/io5';
import { useMemo, forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import { useTranslations, useLocale } from 'next-intl';
import { MediaPickerModal } from '../media-picker-modal';
import { photoActions } from '../../../photos/actions/photo-actions';
import { videoActions } from '../../../videos/actions/video-actions';
import { audioActions } from '../../../audios/actions/audio-actions';
import { fileActions } from '../../../files/actions/file-actions';
import { PhotoPreviewModal, PhotoMaterialPreview } from '@/components/common/photo-preview-modal';
import { generateId, ensureBlockId, parseContent, handleUrlConversion } from './utils/block-note-utils';
import { editor_schema as schema } from './utils/editor-schema';



export interface BlockNoteEditorRef {
  insert_media: (id: string, url: string, type: 'image' | 'video' | 'audio' | 'file') => void;
}

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
    initialContent: useMemo(() => parseContent(initial_content), [initial_content]),
    dictionary: (locales as any)[locale] || locales.en,
    editable: !read_only,
    uploadFile: async (file: File) => {
      let result;
      if (file.type.startsWith('image/')) result = await photoActions.create_photo({ name: file.name, file });
      else if (file.type.startsWith('video/')) result = await videoActions.create_video({ name: file.name, file });
      else if (file.type.startsWith('audio/')) result = await audioActions.create_audio({ name: file.name, file });
      else result = await fileActions.create_file({ name: file.name, file });
      return (result as any)?.data?.file_url || (result as any)?.file_url || '';
    }
  });

  useEffect(() => { editor.isEditable = !read_only; }, [read_only, editor]);

  const handleWrapperClick = (e: React.MouseEvent) => {
    if (!read_only) return;
    const target = e.target as HTMLElement;
    const img = target.closest('img');
    if (img && img.closest('.bn-editor')) {
      const url = img.src;
      const allImages: PhotoMaterialPreview[] = [];
      editor.forEachBlock((block) => {
        if (block.type === 'image' && block.props.url) {
          allImages.push({ id: block.id, name: (block.props as any).name || 'Image', file_url: block.props.url });
        }
        return true;
      });
      const currentPhoto = allImages.find(p => p.file_url === url) || { id: Math.random().toString(), name: 'Image', file_url: url };
      setPreviewPhoto(currentPhoto);
      setPreviewPhotosList(allImages);
      setPreviewOpened(true);
    }
  };

  const handle_selection = (item: { id: string; url: string; name: string; type: 'image' | 'video' | 'audio' | 'file' }) => {
    const selection = editor.getTextCursorPosition();
    const current_block = selection?.block;
    let block_type: any = item.type;
    let props: any = { id: item.id, url: item.url, name: item.name };

    if (item.type === 'video') {
      const youtube_match = item.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      if (youtube_match) { block_type = "youtube"; props = { url: `https://www.youtube.com/embed/${youtube_match[1]}`, videoId: youtube_match[1] }; }
    }
    if (item.type === 'file') props.extension = item.url.split('.').pop() || '';

    if (current_block && current_block.type === 'paragraph' && (!current_block.content || (Array.isArray(current_block.content) && current_block.content.length === 0))) {
      editor.replaceBlocks([current_block.id], [ensureBlockId({ type: block_type, props: props })]);
    } else {
      editor.insertBlocks([ensureBlockId({ type: block_type, props: props })], current_block?.id || editor.document[editor.document.length - 1]?.id, "after");
    }
    setPickerOpened(false);
  };

  const handle_editor_change = () => {
    on_change(JSON.stringify(editor.document, null, 2));
    if (read_only) return;
    handleUrlConversion(editor);
  };

  useImperativeHandle(ref, () => ({
    insert_media: (id: string, url: string, type: 'image' | 'video' | 'audio' | 'file') => {
      handle_selection({ id, url, name: '', type });
    }
  }));

  const custom_slash_items = useMemo(() => {
    const native_media_titles = [editor.dictionary.slash_menu.image.title, editor.dictionary.slash_menu.video.title, editor.dictionary.slash_menu.audio.title, editor.dictionary.slash_menu.file.title, "Image", "Video", "Audio", "File", "Media"];
    const base_items = getDefaultReactSlashMenuItems(editor).filter(item => !native_media_titles.includes(item.title));
    const bank_items = [
      { title: t('photo_from_bank'), subtext: t('photo_from_bank_subtext'), onItemClick: () => { setPickerType('image'); setPickerOpened(true); }, group: t('library'), icon: <IoImageOutline size={18} /> },
      { title: t('video_from_bank'), subtext: t('video_from_bank_subtext'), onItemClick: () => { setPickerType('video'); setPickerOpened(true); }, group: t('library'), icon: <IoVideocamOutline size={18} /> },
      { title: t('audio_from_bank'), subtext: t('audio_from_bank_subtext'), onItemClick: () => { setPickerType('audio'); setPickerOpened(true); }, group: t('library'), icon: <IoMusicalNotesOutline size={18} /> },
      { title: t('file_from_bank'), subtext: t('file_from_bank_subtext'), onItemClick: () => { setPickerType('file'); setPickerOpened(true); }, group: t('library'), icon: <IoDocumentOutline size={18} /> },
    ];
    return [...bank_items, ...base_items];
  }, [editor, t]);

  return (
    <div className={`block-note-wrapper ${read_only ? 'is-read-only' : ''}`} onClick={handleWrapperClick}>
      <BlockNoteView editor={editor} theme={colorScheme === 'dark' ? 'dark' : 'light'} onChange={handle_editor_change} slashMenu={false} formattingToolbar={false}>
        <FormattingToolbarController formattingToolbar={() => (
          <FormattingToolbar>
            <BlockTypeSelect /><BasicTextStyleButton basicTextStyle="bold" /><BasicTextStyleButton basicTextStyle="italic" /><BasicTextStyleButton basicTextStyle="underline" /><BasicTextStyleButton basicTextStyle="strike" /><BasicTextStyleButton basicTextStyle="code" /><TextAlignButton textAlignment="left" /><TextAlignButton textAlignment="center" /><TextAlignButton textAlignment="right" /><ColorStyleButton /><NestBlockButton /><UnnestBlockButton /><CreateLinkButton />
          </FormattingToolbar>
        )} />
        <SuggestionMenuController triggerCharacter={'/'} getItems={async (query) => custom_slash_items.filter((item: any) => item.title.toLowerCase().includes(query.toLowerCase()))} />
      </BlockNoteView>
      <MediaPickerModal opened={pickerOpened} onClose={() => setPickerOpened(false)} onSelect={handle_selection} type={pickerType} />
      <PhotoPreviewModal opened={previewOpened} onClose={() => setPreviewOpened(false)} photo={previewPhoto} photos={previewPhotosList} onPhotoChange={setPreviewPhoto} />
    </div>
  );
});

BlockNoteEditor.displayName = 'BlockNoteEditor';
export default BlockNoteEditor;
