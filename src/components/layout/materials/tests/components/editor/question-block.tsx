'use client';

import React, { useState } from 'react';
import { 
    Paper, 
    Stack, 
    Group, 
    ActionIcon, 
    TextInput, 
    Select, 
    Text, 
    Button, 
    Checkbox, 
    Radio, 
    Box, 
    rem,
    Textarea,
    Slider
} from '@mantine/core';
import { 
    IoTrashOutline, 
    IoDuplicateOutline, 
    IoImageOutline, 
    IoMusicalNotesOutline, 
    IoVideocamOutline,
    IoAddOutline,
    IoReorderTwoOutline
} from 'react-icons/io5';
import {
    MdFormatAlignLeft,
    MdFormatAlignCenter,
    MdFormatAlignRight
} from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { AudioPlayer } from '@/components/ui/audio-player';
import { TestQuestion, QuestionType, QUESTION_TYPES } from '@/components/layout/materials/tests/schemas/test-schema';

interface Props {
  id: string;
  index: number;
  data: TestQuestion;
  on_change: (data: TestQuestion) => void;
  on_remove: () => void;
  on_duplicate: () => void;
  on_open_bank: (type: 'image' | 'video' | 'audio' | 'file') => void;
  read_only?: boolean;
  is_preview?: boolean;
}

/**
 * Helper to get YouTube video ID from URL
 */
const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export function QuestionBlock({ 
    id, 
    index, 
    data, 
    on_change, 
    on_remove, 
    on_duplicate, 
    on_open_bank,
    read_only = false,
    is_preview = false
}: Props) {
  const t = useTranslations('Materials.tests.editor');
  const [selected_options, setSelectedOptions] = useState<string[]>([]);
  const [fill_val, setFillVal] = useState('');
  const [detailed_val, setDetailedVal] = useState('');
  
  const update_type = (type: QuestionType) => {
    on_change({ 
        ...data, 
        type, 
        options: (type === QUESTION_TYPES.SINGLE_CHOICE || type === QUESTION_TYPES.MULTIPLE_CHOICE) 
            ? (data.options || [{ id: crypto.randomUUID(), text: '', is_correct: false }]) 
            : undefined,
        correct_answer_text: type === QUESTION_TYPES.FILL_IN_BLANK ? (data.correct_answer_text || '') : undefined
    });
  };

  const add_option = () => {
    const new_options = [...(data.options || []), { id: crypto.randomUUID(), text: '', is_correct: false }];
    on_change({ ...data, options: new_options });
  };

  const update_option = (opt_id: string, text: string) => {
    const new_options = data.options?.map(o => o.id === opt_id ? { ...o, text } : o);
    on_change({ ...data, options: new_options });
  };

  const toggle_correct = (opt_id: string) => {
    let new_options = data.options?.map(o => {
        if (data.type === QUESTION_TYPES.SINGLE_CHOICE) {
            return { ...o, is_correct: o.id === opt_id };
        } else {
            return o.id === opt_id ? { ...o, is_correct: !o.is_correct } : o;
        }
    });
    on_change({ ...data, options: new_options });
  };

  const remove_option = (opt_id: string) => {
    const new_options = data.options?.filter(o => o.id !== opt_id);
    on_change({ ...data, options: new_options });
  };

  const media_alignment = data.media?.alignment || 'center';
  const media_size = data.media?.size || 100;

  return (
    <Paper 
        withBorder={!is_preview} 
        radius="md" 
        p={is_preview ? "xl" : "md"} 
        className={cn(
            "group relative transition-all",
            is_preview ? "bg-white/[0.02] border-white/5" : "bg-white/5 border-white/10 hover:border-white/20"
        )}
        shadow={is_preview ? "sm" : "none"}
    >
      <Stack gap="md">
        {!is_preview && (
            <Group justify="space-between">
                <Group gap="xs">
                    <Box className="cursor-grab text-zinc-600">
                        <IoReorderTwoOutline size={20} />
                    </Box>
                    <Text fw={600} size="sm" c="dimmed">#{index + 1}</Text>
                    <Select
                        size="xs"
                        data={[
                            { value: QUESTION_TYPES.SINGLE_CHOICE, label: t('types.single_choice') },
                            { value: QUESTION_TYPES.MULTIPLE_CHOICE, label: t('types.multiple_choice') },
                            { value: QUESTION_TYPES.FILL_IN_BLANK, label: t('types.fill_in_blank') },
                            { value: QUESTION_TYPES.DETAILED_ANSWER, label: t('types.detailed_answer') },
                        ]}
                        value={data.type}
                        onChange={(val) => update_type(val as QuestionType)}
                        className="w-48"
                        variant="filled"
                        disabled={read_only}
                    />
                </Group>
                
                <Group gap="xs">
                    <TextInput
                        size="xs"
                        type="number"
                        value={data.points}
                        onChange={(e) => on_change({ ...data, points: parseInt(e.currentTarget.value) || 0 })}
                        label={data.points === 1 ? t('point') : t('points')}
                        styles={{ root: { display: 'flex', alignItems: 'center', gap: '8px' }, label: { order: 2, marginBottom: 0 } }}
                        className="w-24"
                        variant="filled"
                        disabled={read_only}
                    />
                    {!read_only && (
                        <>
                            <ActionIcon variant="subtle" color="gray" onClick={on_duplicate}>
                                <IoDuplicateOutline size={18} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="red" onClick={on_remove}>
                                <IoTrashOutline size={18} />
                            </ActionIcon>
                        </>
                    )}
                </Group>
            </Group>
        )}

        <Stack gap="xs">
            {is_preview ? (
                <Text size="xl" fw={610} style={{ fontSize: rem(22) }} px="md" py="xs">
                    {data.question}
                </Text>
            ) : (
                <Textarea
                    placeholder={t('question_placeholder')}
                    value={data.question}
                    onChange={(e) => on_change({ ...data, question: e.currentTarget.value })}
                    variant="unstyled"
                    size="lg"
                    fw={500}
                    autosize
                    minRows={1}
                    disabled={read_only}
                    styles={{ 
                        input: { 
                            fontSize: rem(20),
                            padding: '12px 16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: rem(8)
                        } 
                    }}
                />
            )}
            
            {!read_only && !is_preview && (
                <Group gap="xs">
                    <ActionIcon variant="light" size="sm" color="gray" onClick={() => on_open_bank('image')}>
                        <IoImageOutline size={16} />
                    </ActionIcon>
                    <ActionIcon variant="light" size="sm" color="gray" onClick={() => on_open_bank('video')}>
                        <IoVideocamOutline size={16} />
                    </ActionIcon>
                    <ActionIcon variant="light" size="sm" color="gray" onClick={() => on_open_bank('audio')}>
                        <IoMusicalNotesOutline size={16} />
                    </ActionIcon>
                </Group>
            )}

            {data.media && (
                <Stack gap="xs" align={media_alignment === 'left' ? 'flex-start' : media_alignment === 'right' ? 'flex-end' : 'center'}>
                    <Box 
                        pos="relative"
                        className="group"
                        style={{ 
                            width: data.media.type === 'audio' ? `${media_size / 3}%` : `${media_size}%`, 
                            maxWidth: '100%' 
                        }}
                    >
                        <Box className="rounded-md overflow-hidden bg-black/10">
                            {data.media.type === 'image' && (
                                <img src={data.media.url} className="w-full h-auto block object-contain" />
                            )}
                            {data.media.type === 'video' && (
                                getYoutubeId(data.media.url) ? (
                                    <Box className="aspect-video w-full">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${getYoutubeId(data.media.url)}`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </Box>
                                ) : (
                                    <video src={data.media.url} controls className="w-full aspect-video" />
                                )
                            )}
                            {data.media.type === 'audio' && (
                                <AudioPlayer src={data.media.url} class_name="max-w-full" />
                            )}
                        </Box>
                        
                        {!read_only && !is_preview && (
                            <ActionIcon 
                                variant="filled" 
                                color="red" 
                                size="sm" 
                                className="absolute! top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-20 hover:scale-110 active:scale-95"
                                onClick={() => on_change({ ...data, media: undefined })}
                                radius="md"
                            >
                                <IoTrashOutline size={16} />
                            </ActionIcon>
                        )}
                    </Box>

                    {!read_only && !is_preview && (data.media.type === 'image' || data.media.type === 'video' || data.media.type === 'audio') && (
                        <Group gap="xl" className="bg-white/5 p-2 rounded-lg border border-white/10">
                            <Group gap={4}>
                                <ActionIcon 
                                    variant={media_alignment === 'left' ? 'filled' : 'light'} 
                                    color={media_alignment === 'left' ? 'blue' : 'gray'} 
                                    onClick={() => on_change({ ...data, media: { ...data.media!, alignment: 'left' } })}
                                    size="sm"
                                >
                                    <MdFormatAlignLeft size={14} />
                                </ActionIcon>
                                <ActionIcon 
                                    variant={media_alignment === 'center' ? 'filled' : 'light'} 
                                    color={media_alignment === 'center' ? 'blue' : 'gray'} 
                                    onClick={() => on_change({ ...data, media: { ...data.media!, alignment: 'center' } })}
                                    size="sm"
                                >
                                    <MdFormatAlignCenter size={14} />
                                </ActionIcon>
                                <ActionIcon 
                                    variant={media_alignment === 'right' ? 'filled' : 'light'} 
                                    color={media_alignment === 'right' ? 'blue' : 'gray'} 
                                    onClick={() => on_change({ ...data, media: { ...data.media!, alignment: 'right' } })}
                                    size="sm"
                                >
                                    <MdFormatAlignRight size={14} />
                                </ActionIcon>
                            </Group>

                            <Group gap="xs" style={{ width: 150 }}>
                                <Text size="xs" c="dimmed" fw={500}>{t('media.size')}</Text>
                                <Slider 
                                    className="flex-1"
                                    size="xs"
                                    value={media_size}
                                    onChange={(val) => on_change({ ...data, media: { ...data.media!, size: val } })}
                                    min={10}
                                    max={100}
                                    label={(val) => `${val}%`}
                                />
                            </Group>
                        </Group>
                    )}
                </Stack>
            )}
        </Stack>

        <Box className="pl-4 border-l-2 border-white/5">
            {/* CHOICE QUESTIONS */}
            {(data.type === QUESTION_TYPES.SINGLE_CHOICE || data.type === QUESTION_TYPES.MULTIPLE_CHOICE) && (
                <Stack gap="sm">
                    {data.options?.map((opt) => (
                        <Group key={opt.id} gap="sm" align="center">
                            {data.type === QUESTION_TYPES.SINGLE_CHOICE ? (
                                <Radio 
                                    checked={is_preview ? selected_options.includes(opt.id) : opt.is_correct} 
                                    onChange={() => {
                                        if (is_preview) {
                                            setSelectedOptions([opt.id]);
                                        } else {
                                            toggle_correct(opt.id);
                                        }
                                    }}
                                    disabled={read_only && !is_preview}
                                />
                            ) : (
                                <Checkbox 
                                    checked={is_preview ? selected_options.includes(opt.id) : opt.is_correct} 
                                    onChange={() => {
                                        if (is_preview) {
                                            setSelectedOptions(prev => prev.includes(opt.id) ? prev.filter(x => x !== opt.id) : [...prev, opt.id]);
                                        } else {
                                            toggle_correct(opt.id);
                                        }
                                    }}
                                    disabled={read_only && !is_preview}
                                />
                            )}
                            {is_preview ? (
                                <Text size="sm" className="flex-1 cursor-pointer" onClick={() => {
                                    if (data.type === QUESTION_TYPES.SINGLE_CHOICE) {
                                        setSelectedOptions([opt.id]);
                                    } else {
                                        setSelectedOptions(prev => prev.includes(opt.id) ? prev.filter(x => x !== opt.id) : [...prev, opt.id]);
                                    }
                                }}>
                                    {opt.text}
                                </Text>
                            ) : (
                                <TextInput
                                    placeholder={t('option_placeholder')}
                                    value={opt.text}
                                    onChange={(e) => update_option(opt.id, e.currentTarget.value)}
                                    variant="filled"
                                    className="flex-1"
                                    size="sm"
                                    disabled={read_only}
                                />
                            )}
                            {!read_only && !is_preview && data.options!.length > 1 && (
                                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => remove_option(opt.id)}>
                                    <IoTrashOutline size={14} />
                                </ActionIcon>
                            )}
                        </Group>
                    ))}
                    {!read_only && !is_preview && (
                        <Button 
                            variant="subtle" 
                            size="xs" 
                            leftSection={<IoAddOutline size={14} />}
                            className="w-fit"
                            onClick={add_option}
                        >
                            {t('add_option')}
                        </Button>
                    )}
                </Stack>
            )}

            {/* FILL IN BLANK */}
            {data.type === QUESTION_TYPES.FILL_IN_BLANK && (
                <Stack gap="xs">
                    {!is_preview && <Text size="xs" c="dimmed">{t('fill_blank_hint')}</Text>}
                    <TextInput
                        placeholder={is_preview ? t('option_placeholder') : t('option_placeholder')}
                        value={is_preview ? fill_val : data.correct_answer_text}
                        onChange={(e) => {
                            if (is_preview) {
                                setFillVal(e.currentTarget.value);
                            } else {
                                on_change({ ...data, correct_answer_text: e.currentTarget.value });
                            }
                        }}
                        variant="filled"
                        disabled={read_only && !is_preview}
                    />
                </Stack>
            )}

            {/* DETAILED ANSWER */}
            {data.type === QUESTION_TYPES.DETAILED_ANSWER && (
                <Stack gap="sm">
                    {is_preview ? (
                        <Textarea 
                            placeholder={t('option_placeholder')}
                            value={detailed_val}
                            onChange={(e) => setDetailedVal(e.currentTarget.value)}
                            minRows={3}
                            variant="filled"
                        />
                    ) : (
                        <Box p="sm" className="bg-white/5 rounded-md border border-white/5 border-dashed">
                            <Text size="sm" c="dimmed" fs="italic">
                                {t('detailed_hint')}
                            </Text>
                        </Box>
                    )}
                </Stack>
            )}
        </Box>
      </Stack>
    </Paper>
  );
}
