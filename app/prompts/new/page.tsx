import { getCategories } from "@/app/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreatePromptForm } from "@/components/create-prompt-form"

export default async function NewPromptPage() {
  const categories = await getCategories()

  return (
    <div className="container py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Prompt</CardTitle>
          <CardDescription>Create a new legal prompt template for your collection</CardDescription>
        </CardHeader>
        <CardContent>
          <CreatePromptForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}

