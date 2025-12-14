import { getPrompts } from "@/app/actions";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PromptListClient } from "./prompt-list-client";

export default async function PromptsPage() {
  const { prompts, error } = await getPrompts();

  return (
    <PageContainer>
      <PageHeader
        title="Legal Prompts"
        description="Manage and organize your AI prompts for legal workflows"
      />
      <PromptListClient prompts={prompts} error={error} />
    </PageContainer>
  );
}

