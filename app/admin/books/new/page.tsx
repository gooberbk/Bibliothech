"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, UploadCloud, X, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { categories, documentTypes } from "@/lib/data"
import { createResource } from "@/actions/resource-actions"
import { useUploadThing } from "@/lib/uploadthing"
import { toast } from "sonner"

type UploadedFileInfo = {
  url: string
  key: string
  sizeMb: number
  name: string
}

export default function NewBookPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null)
  const [coverFileName, setCoverFileName] = React.useState<string | null>(null)
  const [coverUploadProgress, setCoverUploadProgress] = React.useState(0)
  const [coverUploadError, setCoverUploadError] = React.useState<string | null>(null)
  const [uploadedCover, setUploadedCover] = React.useState<UploadedFileInfo | null>(null)
  const [isCoverUploading, setIsCoverUploading] = React.useState(false)
  const [pdfUploadProgress, setPdfUploadProgress] = React.useState(0)
  const [pdfUploadError, setPdfUploadError] = React.useState<string | null>(null)
  const [uploadedPdf, setUploadedPdf] = React.useState<UploadedFileInfo | null>(null)
  const [isPdfUploading, setIsPdfUploading] = React.useState(false)

  const [formData, setFormData] = React.useState({
    title: "",
    author: "",
    type: "",
    category: "",
    pages: "",
    size: "",
    synopsis: "",
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const { startUpload: startCoverUpload } = useUploadThing("coverImage", {
    uploadProgressGranularity: "fine",
    onUploadProgress: (progress) => setCoverUploadProgress(progress),
  })

  const { startUpload: startPdfUpload } = useUploadThing("pdfDocument", {
    uploadProgressGranularity: "fine",
    onUploadProgress: (progress) => setPdfUploadProgress(progress),
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis"
    }
    if (!formData.author.trim()) {
      newErrors.author = "L'auteur est requis"
    }
    if (!formData.type) {
      newErrors.type = "Le type est requis"
    }
    if (!formData.category) {
      newErrors.category = "La catégorie est requise"
    }
    if (!formData.pages || parseInt(formData.pages) <= 0) {
      newErrors.pages = "Le nombre de pages doit être supérieur à 0"
    }
    if (!uploadedPdf) {
      newErrors.pdf = isPdfUploading
        ? "Veuillez attendre la fin de l'upload du PDF"
        : "Le fichier PDF est requis"
    }
    if (!uploadedCover) {
      newErrors.cover = isCoverUploading
        ? "Veuillez attendre la fin de l'upload de la couverture"
        : "L'image de couverture est requise"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverUploadError(null)
      setUploadedCover(null)
      setErrors((prev) => ({ ...prev, cover: "" }))

      if (coverPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview)
      }
      const objectUrl = URL.createObjectURL(file)
      setCoverPreview(objectUrl)
      setCoverFileName(file.name)
      setIsCoverUploading(true)
      setCoverUploadProgress(0)

      try {
        const response = await startCoverUpload([file])
        const uploaded = response?.[0]
        if (!uploaded) {
          throw new Error("Upload de la couverture interrompu.")
        }

        setUploadedCover({
          url: uploaded.ufsUrl,
          key: uploaded.key,
          sizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
          name: file.name,
        })
        setCoverPreview(uploaded.ufsUrl)
        URL.revokeObjectURL(objectUrl)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Échec de l'upload de la couverture."
        setCoverUploadError(message)
        setUploadedCover(null)
      } finally {
        setIsCoverUploading(false)
      }
    }
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPdfUploadError(null)
      setUploadedPdf(null)
      setIsPdfUploading(true)
      setPdfUploadProgress(0)
      setErrors((prev) => ({ ...prev, pdf: "" }))

      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1)
      setFormData({ ...formData, size: `${sizeInMB} Mo` })

      try {
        const response = await startPdfUpload([file])
        const uploaded = response?.[0]
        if (!uploaded) {
          throw new Error("Upload du PDF interrompu.")
        }

        setUploadedPdf({
          url: uploaded.ufsUrl,
          key: uploaded.key,
          sizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
          name: file.name,
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Échec de l'upload du PDF."
        setPdfUploadError(message)
        setUploadedPdf(null)
      } finally {
        setIsPdfUploading(false)
      }
    }
  }

  const removeCover = () => {
    if (coverPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview)
    }
    setCoverPreview(null)
    setCoverFileName(null)
    setCoverUploadProgress(0)
    setCoverUploadError(null)
    setUploadedCover(null)
  }

  const removePdf = () => {
    setUploadedPdf(null)
    setPdfUploadProgress(0)
    setPdfUploadError(null)
    setFormData({ ...formData, size: "" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isPdfUploading || isCoverUploading) {
      toast.error("Veuillez attendre la fin des uploads avant de sauvegarder.")
      return
    }

    if (!validateForm()) return

    setIsLoading(true)
    const loadingToastId = toast.loading("Création de la ressource...")

    try {
      if (!uploadedPdf || !uploadedCover) {
        throw new Error("Les fichiers doivent être uploadés avant la création.")
      }

      await createResource({
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.synopsis.trim() || undefined,
        category: formData.category,
        type: formData.type,
        pageCount: Number.parseInt(formData.pages, 10),
        fileSizeMb: uploadedPdf.sizeMb,
        fileUrl: uploadedPdf.url,
        fileKey: uploadedPdf.key,
        coverUrl: uploadedCover.url,
        coverKey: uploadedCover.key,
      })

      toast.dismiss(loadingToastId)
      toast.success("Ressource ajoutée avec succès !")
      router.push("/admin/books")
      router.refresh()
    } catch (error) {
      toast.dismiss(loadingToastId)
      const message = error instanceof Error ? error.message : "Une erreur est survenue."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const isAnyUploadPending = isPdfUploading || isCoverUploading

  const isFormValid =
    formData.title &&
    formData.author &&
    formData.type &&
    formData.category &&
    formData.pages &&
    parseInt(formData.pages) > 0 &&
    !!uploadedPdf &&
    !!uploadedCover &&
    !isAnyUploadPending

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/books">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Nouvelle Ressource
          </h1>
          <p className="mt-1 text-muted-foreground">
            Ajoutez un nouveau livre ou document à la bibliothèque.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations Générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Introduction aux Algorithmes"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Auteur *</Label>
                  <Input
                    id="author"
                    placeholder="Ex: Dr. Mohamed Benameur"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    className={errors.author ? "border-destructive" : ""}
                  />
                  {errors.author && (
                    <p className="text-xs text-destructive">{errors.author}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger
                        className={errors.type ? "border-destructive" : ""}
                      >
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-xs text-destructive">{errors.type}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Module (Catégorie) *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger
                        className={errors.category ? "border-destructive" : ""}
                      >
                        <SelectValue placeholder="Sélectionnez un module" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-xs text-destructive">
                        {errors.category}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pages">Nombre de Pages *</Label>
                    <Input
                      id="pages"
                      type="number"
                      min="1"
                      placeholder="Ex: 120"
                      value={formData.pages}
                      onChange={(e) =>
                        setFormData({ ...formData, pages: e.target.value })
                      }
                      className={errors.pages ? "border-destructive" : ""}
                    />
                    {errors.pages && (
                      <p className="text-xs text-destructive">{errors.pages}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Poids du Fichier (Mo)</Label>
                    <Input
                      id="size"
                      placeholder="Ex: 8.4 Mo"
                      value={formData.size}
                      onChange={(e) =>
                        setFormData({ ...formData, size: e.target.value })
                      }
                      disabled={!!uploadedPdf || isPdfUploading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="synopsis">Synopsis</Label>
                  <Textarea
                    id="synopsis"
                    placeholder="Décrivez le contenu du document..."
                    rows={5}
                    value={formData.synopsis}
                    onChange={(e) =>
                      setFormData({ ...formData, synopsis: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* PDF Upload */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>Fichier PDF</CardTitle>
                  {uploadedPdf && !isPdfUploading && (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600">
                      Upload termine
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!uploadedPdf ? (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:bg-muted/50">
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">
                      Glissez-déposez votre fichier ici ou cliquez pour
                      parcourir
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF jusqu&apos;à 64MB
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                      disabled={isPdfUploading}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <UploadCloud className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{uploadedPdf?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formData.size}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removePdf}
                      disabled={isPdfUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {isPdfUploading && (
                  <div className="mt-3 space-y-2">
                    <Progress value={pdfUploadProgress} />
                    <p className="text-xs text-muted-foreground">
                      Upload du PDF en cours... {pdfUploadProgress}%
                    </p>
                  </div>
                )}
                {uploadedPdf && !isPdfUploading && (
                  <p className="mt-2 text-xs text-emerald-600">
                    PDF envoyé avec succès.
                  </p>
                )}
                {errors.pdf && (
                  <p className="mt-2 text-xs text-destructive">{errors.pdf}</p>
                )}
                {pdfUploadError && (
                  <p className="mt-2 text-xs text-destructive">{pdfUploadError}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Cover Upload */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>Image de Couverture</CardTitle>
                  {uploadedCover && !isCoverUploading && (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600">
                      Upload termine
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!coverPreview ? (
                  <label className="flex aspect-[2/3] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border transition-colors hover:bg-muted/50">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-center text-sm font-medium">
                      Cliquez pour ajouter
                    </p>
                    <p className="mt-1 text-center text-xs text-muted-foreground">
                      JPG, PNG jusqu&apos;à 4MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                      disabled={isCoverUploading}
                    />
                  </label>
                ) : (
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                    <Image
                      src={coverPreview}
                      alt="Aperçu de la couverture"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={removeCover}
                      disabled={isCoverUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {coverFileName && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {coverFileName}
                  </p>
                )}
                {isCoverUploading && (
                  <div className="mt-3 space-y-2">
                    <Progress value={coverUploadProgress} />
                    <p className="text-xs text-muted-foreground">
                      Upload de la couverture en cours... {coverUploadProgress}%
                    </p>
                  </div>
                )}
                {uploadedCover && !isCoverUploading && (
                  <p className="mt-2 text-xs text-emerald-600">
                    Couverture envoyée avec succès.
                  </p>
                )}
                {errors.cover && (
                  <p className="mt-2 text-xs text-destructive">{errors.cover}</p>
                )}
                {coverUploadError && (
                  <p className="mt-2 text-xs text-destructive">
                    {coverUploadError}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={!isFormValid || isLoading || isAnyUploadPending}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : isAnyUploadPending ? (
                  "Upload en cours..."
                ) : (
                  "Sauvegarder"
                )}
              </Button>
              <Button type="button" variant="outline" asChild className="w-full">
                <Link href="/admin/books">Annuler</Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
