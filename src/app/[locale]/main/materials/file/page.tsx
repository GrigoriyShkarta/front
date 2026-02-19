import { PageContainer } from "@/components/common/page-container";
import FilesLayout from "@/components/layout/materials/files/files-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "File Materials | Lirnexa",
  description: "Manage your file materials",
};

export default function FilesPage() {
  return (
    <PageContainer>
      <FilesLayout />
    </PageContainer>
  );
}
