import { PageContainer } from "@/components/common/page-container";
import NotesLayout from "@/components/layout/materials/notes/notes-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes | Lirnexa",
  description: "Manage your notes",
};

export default function NotesPage() {
  return (
    <PageContainer>
      <NotesLayout />
    </PageContainer>
  );
}
