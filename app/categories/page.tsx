import { Suspense } from "react"
import { getCategories } from "@/app/actions"
import { CategoryManager } from "@/components/category-manager"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { CategoryManagerSkeleton } from "@/components/category-manager-skeleton"

async function CategoriesList() {
  try {
    const { data: categories, error } = await getCategories()

    if (error) {
      return (
        <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-700 flex-shrink-0" />
            <h2 className="text-xl font-semibold">Error Loading Categories</h2>
          </div>
          <p>{error.message || "An unknown error occurred."}</p>
        </div>
      )
    }

    if (!categories || categories.length === 0) {
      return (
        <div className="mt-4 sm:mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed p-6 sm:p-12 text-center bg-muted/20">
          <h2 className="text-xl sm:text-2xl font-semibold">No categories found</h2>
          <p className="mt-3 text-muted-foreground max-w-md px-4 text-sm sm:text-base">
            Get started by creating a new category.
          </p>
        </div>
      )
    }

    return <CategoryManager initialCategories={categories} />
  } catch (e: any) {
    console.error("Error in CategoriesList:", e)
    return (
      <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-700 flex-shrink-0" />
          <h2 className="text-xl font-semibold">Error</h2>
        </div>
        <p>An unexpected error occurred while loading categories.</p>
        <p className="mt-2 text-sm font-mono">{e.message}</p>
      </div>
    )
  }
}

export default async function CategoriesPage() {
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
        <Suspense fallback={<CategoryManagerSkeleton />}>
          <CategoriesList />
        </Suspense>
      </div>
    </PageContainer>
  )
}

