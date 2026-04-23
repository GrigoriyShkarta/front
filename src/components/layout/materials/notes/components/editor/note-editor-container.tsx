'use client';

import { Box, LoadingOverlay, Grid, Stack, Button, Group } from '@mantine/core';
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
}

export default function NoteEditorContainer({ 
    id, is_read_only = false, is_access_mode = false, pinned_student_id, student_name,
    hide_additional = false, hide_edit = false, hide_back = false, hide_title = false,
    compact = false, prevent_redirect = false
}: Props) {
  const state = useNoteEditorState({ id, is_read_only, is_access_mode, pinned_student_id, student_name, prevent_redirect });

  return (
    <Box 
        maw={compact ? '100%' : 1000} 
        mx="auto" py={compact ? 0 : "xl"} px={compact ? 0 : "md"} 
        onDragOver={(e) => e.preventDefault()}
        pos="relative" className="transition-all duration-500 ease-in-out"
    >
      <LoadingOverlay visible={state.is_loading_note || state.is_saving} overlayProps={{ blur: 2 }} zIndex={100} />

      <Grid gutter={compact ? 20 : 40} align="flex-start">
        <Grid.Col span={12} pos="relative">
            <Stack gap={compact ? "md" : "xl"} className="transition-all duration-500">
                <NoteHeader 
                    is_access_mode={is_access_mode} readOnly={state.readOnly} is_student={state.is_student} title={state.title} 
                    full_access={true} is_saving_access={false} is_saving={state.is_saving}
                    onBack={state.handleBack} onToggleFullAccess={() => {}} onSaveAccess={() => {}}
                    onEdit={() => state.setReadOnly(false)} onToggleAdditional={() => state.setAdditionalOpened(true)} onSave={state.handleSave}
                    hide_additional={hide_additional} hide_edit={hide_edit} hide_back={hide_back}
                    pinned_student_id={pinned_student_id}
                    t={state.t} common_t={state.common_t}
                />

                {/* For note title changes since cover was removed in notes */}
                {!state.readOnly && !hide_title && (
                    <Box>
                        <input
                            type="text"
                            value={state.title}
                            onChange={(e) => state.setTitle(e.target.value)}
                            placeholder={state.t('editor.title_placeholder')}
                            className="w-full text-3xl font-bold bg-transparent border-none outline-none text-[var(--mantine-color-text)] placeholder:text-[var(--mantine-color-dimmed)]"
                        />
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
                        <Box h={400} pos="relative">
                            <LoadingOverlay visible={true} overlayProps={{ blur: 1 }} />
                        </Box>
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
