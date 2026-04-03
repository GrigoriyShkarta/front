'use client';

import { Box, LoadingOverlay, Grid, Stack } from '@mantine/core';
import { useLessonEditorState } from '../../hooks/use-lesson-editor-state';
import { LessonHeader } from './segments/lesson-header';
import { LessonCover } from './segments/lesson-cover';
import { LessonBlocksList } from './segments/lesson-blocks-list';
import { LessonHomeworkSection } from './segments/lesson-homework-section';
import { LessonSidebar } from './segments/lesson-sidebar';
import { LessonSettingsDrawer } from './segments/lesson-settings-drawer';
import { LessonModals } from './segments/lesson-modals';

interface Props {
    id?: string;
    is_read_only?: boolean;
    course_id?: string;
    student_id?: string;
    is_access_mode?: boolean;
}

export default function LessonEditorContainer({ id, is_read_only = false, course_id, student_id, is_access_mode = false }: Props) {
  const state = useLessonEditorState({ id, student_id, course_id, is_read_only, is_access_mode });

  return (
    <Box 
        maw={course_id ? (state.sidebar_opened ? 1600 : 1200) : 1000} 
        mx="auto" py="xl" px="md" onMouseUp={state.handleMouseUp} onMouseLeave={state.handleMouseUp} 
        pos="relative" className="transition-all duration-500 ease-in-out"
    >
      <LoadingOverlay visible={state.is_loading_lesson || state.is_saving || (!!course_id && state.is_loading_context_course)} overlayProps={{ blur: 2 }} zIndex={100} />
      
      <LessonSidebar 
        course_id={course_id} context_course={state.context_course} 
        sidebar_opened={state.sidebar_opened} onToggle={() => state.setSidebarOpened(!state.sidebar_opened)} 
        all_lessons={state.all_lessons_context} all_tests={state.all_tests} t={state.t} 
      />

      <Grid gutter={40} align="flex-start">
        <Grid.Col span={{ base: 12, lg: (course_id && state.sidebar_opened) ? 8 : 12 }} pos="relative">
            <Stack gap="xl" className="transition-all duration-500" style={{ 
                    userSelect: (state.readOnly && state.isCopyingDisabled && state.is_student) ? 'none' : undefined,
                    WebkitUserSelect: (state.readOnly && state.isCopyingDisabled && state.is_student) ? 'none' : undefined,
                } as React.CSSProperties}
            >
                <LessonHeader 
                    is_access_mode={is_access_mode} readOnly={state.readOnly} is_student={state.is_student} title={state.title} 
                    full_access={state.full_access} is_saving_access={state.is_saving_access} is_saving={state.is_saving}
                    onBack={state.handleBack} onToggleFullAccess={state.handleToggleFullAccess} onSaveAccess={state.handleSaveAccess}
                    onEdit={() => state.setReadOnly(false)} onToggleAdditional={() => state.setAdditionalOpened(true)} onSave={state.handleSave}
                    t={state.t} common_t={state.common_t}
                />

                <LessonCover 
                    readOnly={state.readOnly} cover={state.cover} coverPosition={state.coverPosition} title={state.title}
                    isRepositioning={state.isRepositioning} isDragging={state.isDragging} containerRef={state.containerRef}
                    onAddCover={() => { state.setActiveBlockId('cover'); state.setBankType('image'); state.setBankOpened(true); }}
                    onStartReposition={state.startRepositioning} onEndReposition={() => state.setIsRepositioning(false)} 
                    onRemoveCover={() => state.setCover(null)} onMouseDown={state.handleMouseDown} onMouseMove={state.handleMouseMove} 
                    onTitleChange={state.setTitle} t={state.t}
                />

                <LessonBlocksList 
                    blocks={state.blocks} readOnly={state.readOnly} is_access_mode={is_access_mode} accessible_block_ids={state.accessible_block_ids}
                    onBlockChange={state.updateBlockContent} onBlockRemove={state.removeBlock} onOpenBank={state.openBank} onMove={state.moveBlock}
                    onCheckedChange={state.handleToggleBlockAccess} onAddBlock={state.addBlock} editorRefs={state.editorRefs} t={state.t}
                />

                <LessonHomeworkSection 
                    is_student={state.is_student} homeworkId={state.homeworkId} is_creating_hw={state.is_creating_hw}
                    is_editing_hw={state.is_editing_hw} is_saving_hw={state.is_saving_hw} lesson={state.lesson} hw_content={state.hw_content}
                    onHwContentChange={state.setHwContent} onStartCreate={() => { state.setHwContent('[]'); state.setIsCreatingHw(true); }}
                    onStartEdit={() => { state.setHwContent(typeof state.lesson?.homework?.content === 'string' ? state.lesson.homework.content : JSON.stringify(state.lesson?.homework?.content || [])); state.setIsEditingHw(true); }}
                    onDelete={() => state.setDeleteHwModalOpened(true)} onCancel={() => { state.setIsCreatingHw(false); state.setIsEditingHw(false); }}
                    onSave={state.handle_save_homework} t={state.t} tHw={state.tHw}
                />
            </Stack>
        </Grid.Col>
      </Grid>

      <LessonSettingsDrawer 
            opened={state.additionalOpened} onClose={() => state.setAdditionalOpened(false)} duration={state.duration} onDurationChange={state.setDuration}
            categoryIds={state.categoryIds} onCategoriesChange={state.setCategoryIds} all_categories={state.all_categories}
            homeworkId={state.homeworkId} onHomeworkChange={state.setHomeworkId} all_homeworks={state.all_homeworks}
            courseIds={state.courseIds} onCoursesChange={state.setCourseIds} all_courses={state.all_courses}
            isCopyingDisabled={state.isCopyingDisabled} onToggleCopying={state.setIsCopyingDisabled}
            addFilesToMaterials={state.addFilesToMaterials} onToggleAddFiles={state.setAddFilesToMaterials}
            onOpenCategoryDrawer={() => state.setCategoryDrawerOpened(true)} t={state.t} common_t={state.common_t}
      />

      <LessonModals 
            discardOpened={state.discardModalOpened} bankOpened={state.bankOpened} bankType={state.bankType} categoryDrawerOpened={state.category_drawer_opened}
            onDiscardClose={() => state.setDiscardModalOpened(false)} onDiscardConfirm={state.router.back} onBankClose={() => state.setBankOpened(false)}
            onMediaSelect={state.handleMediaSelect} onCategoryDrawerClose={() => state.setCategoryDrawerOpened(false)}
            onCategorySubmit={state.handle_category_create_submit} 
            deleteHwOpened={state.deleteHwModalOpened}
            onDeleteHwClose={() => state.setDeleteHwModalOpened(false)}
            onDeleteHwConfirm={() => {
                state.handle_delete_homework();
                state.setDeleteHwModalOpened(false);
            }}
            t={state.t}
            tHw={state.tHw}
      />
    </Box>
  );
}
