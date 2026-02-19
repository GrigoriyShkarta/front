import { PageContainer } from "@/components/common/page-container";
import { CourseView } from "@/components/layout/materials/courses/course/course-view";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    return (
        <PageContainer>
            <CourseView id={id} />
        </PageContainer>
    );
}
