import { getCategories } from "@/app/actions"
import { CategoryManager } from "@/components/category-manager"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <PageContainer maxWidth="lg">
      <PageHeader
        title="Manage Categories"
        description="Create, edit, and organize your prompt categories"
        actions={
          <Link href="/" passHref>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Prompts
            </Button>
          </Link>
        }
      />

      <div className="max-w-3xl mx-auto">
        <CategoryManager initialCategories={categories} />
      </div>
    </PageContainer>
  )
}

