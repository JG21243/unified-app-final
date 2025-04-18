import { notFound } from "next/navigation"
import Link from "next/link"
import { getLegalPromptById } from "@/app/actions"
import { EditPromptForm } from "@/components/edit-prompt-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"

export default async function EditPromptPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)
  const prompt = await getLegalPromptById(id)

  if (!prompt) {
    notFound()
  }

  return (
    <PageContainer maxWidth="lg">
      <PageHeader
        title="Edit Prompt"
        description={`Editing "${prompt.name}"`}
        actions={
          <Link href={`/prompts/${id}`} passHref>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Prompt
            </Button>
          </Link>
        }
      />

      <div className="max-w-2xl mx-auto">
        <EditPromptForm prompt={prompt} />
      </div>
    </PageContainer>
  )
}

