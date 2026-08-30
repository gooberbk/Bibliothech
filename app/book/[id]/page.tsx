import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ChevronRight,
  Download,
  FileText,
  HardDrive,
  Calendar,
  Home,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FavoriteButton } from "@/components/favorite-button"
import { DownloadButton } from "@/components/download-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { isSecureUploadthingUrl } from "@/lib/uploadthing-security"

type BookDetailsPageProps = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function BookDetailsPage({ params }: BookDetailsPageProps) {
  const { id } = await params
  let session
  let resource
  let relatedResources = []

  try {
    session = await auth()
    resource = await db.resource.findUnique({
      where: { id },
      include: {
        favoritedBy: session?.user.id
          ? {
              where: { userId: session.user.id },
              select: { id: true },
            }
          : false,
      },
    })

    if (resource) {
      relatedResources = await db.resource.findMany({
        where: {
          id: { not: resource.id },
          category: resource.category,
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      })
    }
  } catch (error) {
    console.error("Error fetching book details:", error)
    // Return a simple error page
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Ressource non disponible</h1>
            <p className="mt-2 text-muted-foreground">
              Impossible de charger les détails de cette ressource.
            </p>
            <a href="/" className="mt-4 inline-block text-primary hover:underline">
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Ressource non trouvée</h1>
            <p className="mt-2 text-muted-foreground">
              Cette ressource n'existe pas ou a été supprimée.
            </p>
            <a href="/" className="mt-4 inline-block text-primary hover:underline">
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    )
  }

  const canRenderCover = isSecureUploadthingUrl(resource.coverUrl)
  const canDownloadFile = isSecureUploadthingUrl(resource.fileUrl)
  const isAuthenticated = Boolean(session?.user?.id)
  const isFavorite = Boolean(resource.favoritedBy?.length)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Accueil
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/?category=${resource.category}`}>
                  {resource.category}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[200px] truncate">
                  {resource.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero Section */}
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Cover Image */}
            <div className="md:col-span-4">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-2xl dark:shadow-primary/20">
                {canRenderCover ? (
                  <Image
                    src={resource.coverUrl}
                    alt={resource.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
                    Image indisponible
                  </div>
                )}
              </div>
            </div>

            {/* Book Info */}
            <div className="md:col-span-8">
              <Badge variant="outline" className="mb-4">
                {resource.type}
              </Badge>

              <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {resource.title}
              </h1>

              <p className="mt-2 text-lg text-muted-foreground">
                Par{" "}
                <Link
                  href={`/?author=${encodeURIComponent(resource.author)}`}
                  className="font-medium text-primary hover:underline"
                >
                  {resource.author}
                </Link>
              </p>

              {/* Stats Row */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Download className="h-4 w-4" />
                  {resource.downloadCount.toLocaleString()} téléchargements
                </span>
              </div>

              {/* Attributes Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">
                      Pages
                    </span>
                  </div>
                  <p className="mt-1 font-semibold">{resource.pageCount} pages</p>
                </div>

                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <HardDrive className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">
                      Poids
                    </span>
                  </div>
                  <p className="mt-1 font-semibold">
                    {resource.fileSizeMb.toFixed(1)} Mo
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">
                      Date
                    </span>
                  </div>
                  <p className="mt-1 font-semibold">
                    {new Date(resource.createdAt).toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <DownloadButton
                  resourceId={resource.id}
                  fileUrl={resource.fileUrl}
                  canDownload={canDownloadFile}
                  fileType="PDF"
                  isAuthenticated={isAuthenticated}
                />
                <FavoriteButton
                  resourceId={resource.id}
                  isAuthenticated={isAuthenticated}
                  initialIsFavorite={isFavorite}
                />
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="description" className="mt-12">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="sommaire">Sommaire</TabsTrigger>
              <TabsTrigger value="similaires">Ressources Similaires</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose prose-zinc max-w-none dark:prose-invert">
                <p className="text-base leading-relaxed text-muted-foreground">
                  {resource.description ??
                    "Aucune description fournie pour cette ressource."}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="sommaire" className="mt-6">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold">Table des matières</h3>
                <p className="text-sm text-muted-foreground">
                  Le sommaire n&apos;est pas encore disponible pour cette ressource.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="similaires" className="mt-6">
              {relatedResources.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {relatedResources.map((related) => (
                    <Link
                      key={related.id}
                      href={`/book/${related.id}`}
                      className="overflow-hidden rounded-xl border border-border bg-card"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                        {isSecureUploadthingUrl(related.coverUrl) ? (
                          <Image
                            src={related.coverUrl}
                            alt={related.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            Image indisponible
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="line-clamp-2 font-medium">{related.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {related.author}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Aucune ressource similaire trouvée.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
