import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CatalogueClient } from "@/components/catalogue-client"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import { getResourcesListCached } from "@/lib/catalog-cache"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let resources: any[] = []
  try {
    resources = await getResourcesListCached()
  } catch (error) {
    console.error("Error fetching resources from database:", error)
    // Return empty array if database fails
    resources = []
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background py-20 lg:py-32">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Nouveau : Séries d&apos;exercices 2CP ajoutées
            </Badge>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              La connaissance académique, centralisée et accessible.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Accédez instantanément aux ressources, livres de référence, séries
              de TD et résumés pour l&apos;informatique et les sciences
              fondamentales.
            </p>
          </div>
        </section>

        {/* Catalogue Section */}
        <CatalogueClient resources={resources} />
      </main>

      <Footer />
    </div>
  )
}
