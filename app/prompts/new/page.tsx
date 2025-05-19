import { getCategories } from "@/app/actions"
import { Card, CardContent } from "@/components/ui/card"
import { CreatePromptForm } from "@/components/create-prompt-form"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"

export default async function NewPromptPage() {
  const categories = await getCategories()

  return (
    <PageContainer maxWidth="lg">
      <PageHeader
        title="Create New Prompt"
        description="Create a new legal prompt template for your collection"
      />
      <Card className="max-w-2xl mx-auto">
        <CardContent>
          <CreatePromptForm categories={categories} />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

