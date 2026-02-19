import { PageContainer } from "@/components/common/page-container";
import LessonsLayout from "@/components/layout/materials/lessons/lessons-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lessons | Lirnexa",
  description: "Manage your lessons and courses",
};

export default function LessonsPage() {
  return (
    <PageContainer>
      <LessonsLayout />
    </PageContainer>
  );
}
