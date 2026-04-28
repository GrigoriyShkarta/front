'use client';

import { Box, LoadingOverlay, Grid, Stack, Button, Group, Switch } from '@mantine/core';
import { useNoteEditorState } from '../../hooks/use-note-editor-state';
import { LessonHeader as NoteHeader } from '@/components/layout/materials/lessons/components/editor/segments/lesson-header';
import BlockNoteEditor from '@/components/layout/materials/lessons/components/editor/block-note';
import { NoteSettingsDrawer } from './segments/note-settings-drawer';
import { LessonModals as NoteModals } from '@/components/layout/materials/lessons/components/editor/segments/lesson-modals';

interface Props {
    id?: string;
    is_read_only?: boolean;
    is_access_mode?: boolean;
    pinned_student_id?: string;
    student_name?: string;
    hide_additional?: boolean;
    hide_edit?: boolean;
    hide_back?: boolean;
    hide_title?: boolean;
    compact?: boolean;
    prevent_redirect?: boolean;
    force_new?: boolean;
    hide_access_toggle?: boolean;
    disable_auto_save?: boolean;
    hide_loader?: boolean;
    onIdChange?: (id: string) => void;
}

export default function NoteEditorContainer({ 
    id, is_read_only = false, is_access_mode = false, pinned_student_id, student_name,
    hide_additional = false, hide_edit = false, hide_back = false, hide_title = false,
    compact = false, prevent_redirect = false, force_new = false, hide_access_toggle = false,
    disable_auto_save = false, hide_loader = false, onIdChange
}: Props) {
  const state = useNoteEditorState({ 
    id, is_read_only, is_access_mode, pinned_student_id, student_name, 
    prevent_redirect, force_new, disable_auto_save, onIdChange 
  });

  return (
    <Box 
        maw={compact ? '100%' : 1000} 
        mx="auto" py={compact ? 0 : "xl"} px={compact ? 0 : "md"} 
        onDragOver={(e) => e.preventDefault()}
        pos="relative" className="transition-all duration-500 ease-in-out"
    >
      <LoadingOverlay visible={!hide_loader && (state.is_loading_note || state.is_saving)} overlayProps={{ blur: 2 }} zIndex={100} />

      <Grid gutter={compact ? 20 : 40} align="flex-start">
        <Grid.Col span={12} pos="relative">
            <Stack gap={compact ? "md" : "xl"} className="transition-all duration-500">
                <NoteHeader 
                    is_access_mode={is_access_mode} readOnly={state.readOnly} is_student={state.is_student} title={state.title} 
                    full_access={true} is_saving_access={false} is_saving={state.is_saving}
                    onBack={state.handleBack} onToggleFullAccess={() => {}} onSaveAccess={() => {}}
                    onEdit={() => state.setReadOnly(false)} onToggleAdditional={() => state.setAdditionalOpened(true)} onSave={state.handleSave}
                    hide_additional={hide_additional} hide_edit={hide_edit} hide_back={hide_back}
                    hide_save={!!pinned_student_id && !disable_auto_save}
                    pinned_student_id={pinned_student_id}
                    t={state.t} common_t={state.common_t}
                />

                {pinned_student_id && !state.readOnly && !hide_access_toggle && (
                    <Group justify="space-between" px="sm" py="6px" className="bg-secondary/5 rounded-lg border border-secondary/10">
                        <Stack gap={0}>
                            <Group gap={6} align="center">
                                <Box fw={600} className="text-[13px] text-[var(--mantine-color-text)]">
                                    {state.t('editor.grant_access')}
                                </Box>
                                <Box fw={500} className="text-[11px] text-primary opacity-80">
                                    • {state.t('editor.auto_save_hint')}
                                </Box>
                            </Group>
                            <Box className="text-[11px] opacity-60 text-[var(--mantine-color-dimmed)]">
                                {state.t('editor.grant_access_desc')}
                            </Box>
                        </Stack>
                        <Switch 
                            checked={state.hasStudentAccess}
                            onChange={(e) => state.setHasStudentAccess(e.currentTarget.checked)}
                            size="sm"
                            color="primary"
                        />
                    </Group>
                )}

                {/* For note title changes since cover was removed in notes */}
                {!hide_title && (
                    <Box ta="center">
                        {state.readOnly ? (
                            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--mantine-color-text)] mb-2 tracking-tight">
                                {state.title || state.t('editor.untitled_note')}
                            </h1>
                        ) : (
                            <input
                                type="text"
                                value={state.title}
                                onChange={(e) => state.setTitle(e.target.value)}
                                placeholder={state.t('editor.title_placeholder')}
                                className="w-full text-center text-4xl! md:text-4xl font-bold bg-transparent border-none outline-none text-[var(--mantine-color-text)] placeholder:text-[var(--mantine-color-dimmed)] mb-2"
                            />
                        )}
                    </Box>
                )}

                <Box className={`min-h-[400px] border rounded-lg overflow-hidden ${state.readOnly ? 'border-transparent' : 'border-[var(--mantine-color-default-border)]'}`}>
                    {state.content !== null ? (
                        <BlockNoteEditor
                            key={id || 'new'}
                            ref={state.editorRef}
                            initial_content={state.content}
                            on_change={state.setContent}
                            on_open_bank={state.openBank}
                            read_only={state.readOnly}
                        />
                    ) : (
                        <Box h={400} />
                    )}
                </Box>
            </Stack>
        </Grid.Col>
      </Grid>

      <NoteSettingsDrawer 
            opened={state.additionalOpened} onClose={() => state.setAdditionalOpened(false)}
            categoryIds={state.categoryIds} onCategoriesChange={state.setCategoryIds} all_categories={state.all_categories}
            studentIds={state.studentIds} onStudentsChange={state.setStudentIds} all_students={state.all_students}
            onOpenCategoryDrawer={() => state.setCategoryDrawerOpened(true)} 
            onSave={state.handleSave}
            is_saving={state.is_saving}
            t={state.t} common_t={state.common_t}
      />

      <NoteModals 
            discardOpened={state.discardModalOpened} bankOpened={false} bankType={'image'} categoryDrawerOpened={state.category_drawer_opened}
            onDiscardClose={() => state.setDiscardModalOpened(false)} onDiscardConfirm={state.router.back} onBankClose={() => {}}
            onMediaSelect={state.handleMediaSelect} onCategoryDrawerClose={() => state.setCategoryDrawerOpened(false)}
            onCategorySubmit={state.handle_category_create_submit} 
            deleteHwOpened={false}
            onDeleteHwClose={() => {}}
            onDeleteHwConfirm={() => {}}
            t={state.t}
            tHw={state.common_t}
      />
    </Box>
  );
}
