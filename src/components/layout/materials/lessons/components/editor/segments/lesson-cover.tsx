'use client';

import { Paper, Stack, Button, Box, Title, TextInput } from '@mantine/core';
import { IoImageOutline, IoAddOutline, IoTrashOutline } from 'react-icons/io5';

interface LessonCoverProps {
    readOnly: boolean;
    cover: string | null;
    coverPosition: number;
    title: string;
    isRepositioning: boolean;
    isDragging: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onAddCover: () => void;
    onStartReposition: () => void;
    onEndReposition: () => void;
    onRemoveCover: () => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onTitleChange: (val: string) => void;
    t: (key: string) => string;
}

export function LessonCover({
    readOnly, cover, coverPosition, title, isRepositioning, isDragging, containerRef,
    onAddCover, onStartReposition, onEndReposition, onRemoveCover, onMouseDown, onMouseMove,
    onTitleChange, t
}: LessonCoverProps) {
    return (
        <Paper p={readOnly ? 0 : "xl"} radius="md" withBorder={!readOnly} bg="transparent" pos="relative">
            <Stack gap="xs" mb="lg">
                {!cover ? (
                    !readOnly && (
                        <Button 
                            variant="subtle" color="gray" size="compact-xs" 
                            onClick={onAddCover}
                            className="w-fit"
                            leftSection={<IoImageOutline size={14} />}
                        >
                            {t('editor.add_cover')}
                        </Button>
                    )
                ) : (
                    <Box 
                        ref={containerRef}
                        className={`group relative w-full h-[250px] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 select-none ${readOnly ? 'border-none' : ''}`}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        style={{ cursor: (!readOnly && isRepositioning) ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                    >
                        <img 
                            src={cover} 
                            alt="Lesson cover" 
                            draggable={false}
                            style={{ 
                                width: '100%', height: '100%', objectFit: 'cover',
                                objectPosition: `center ${coverPosition}%`
                            }} 
                        />
                        
                        {!readOnly && !isRepositioning && (
                            <Box className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 justify-center">
                                <Button 
                                    variant="filled" color="white" size="xs" onClick={onAddCover}
                                    className="text-black" leftSection={<IoImageOutline size={14} />}
                                >
                                    {t('editor.change_cover')}
                                </Button>
                                <Button 
                                    variant="filled" color="white" size="xs" onClick={onStartReposition}
                                    className="text-black" leftSection={<IoAddOutline size={14} />} 
                                >
                                    {t('editor.reposition_cover')}
                                </Button>
                                <Button 
                                    variant="filled" color="red" size="xs" onClick={onRemoveCover}
                                    leftSection={<IoTrashOutline size={14} />}
                                >
                                    {t('editor.remove_cover')}
                                </Button>
                            </Box>
                        )}

                        {!readOnly && isRepositioning && (
                            <Box className="absolute bottom-4 right-4 flex gap-xs">
                                 <Button 
                                    variant="filled" color="white" size="xs" 
                                    className="text-black shadow-lg"
                                    onClick={onEndReposition}
                                >
                                    {t('editor.save_position')}
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}
            </Stack>

            {readOnly ? (
                <Title order={1} size="h1" fw={700} style={{ fontSize: '3.5rem', textAlign: 'center' }}>{title}</Title>
            ) : (
                <TextInput
                    placeholder={t('table.name')}
                    variant="unstyled"
                    size="50px"
                    value={title}
                    onChange={(e) => onTitleChange(e.currentTarget.value)}
                    styles={{
                        input: {
                            fontSize: '3.5rem', fontWeight: 700, height: 'auto',
                            padding: 0, textAlign: 'center',
                        }
                    }}
                />
            )}
        </Paper>
    );
}
