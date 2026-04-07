"use client"

import * as React from "react"
import Link from "next/link"
import { DownloadCloud, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { incrementDownload } from "@/actions/resource-actions"
import { Button } from "@/components/ui/button"

type DownloadButtonProps = {
  resourceId: string
  fileUrl: string
  canDownload: boolean
  fileType: string
  isAuthenticated: boolean
}

export function DownloadButton({
  resourceId,
  fileUrl,
  canDownload,
  fileType,
  isAuthenticated,
}: DownloadButtonProps) {
  const [isPending, startTransition] = React.useTransition()

  const onDownload = () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour telecharger cette ressource.")
      return
    }
    if (!canDownload) {
      toast.error("Lien de telechargement invalide.")
      return
    }

    startTransition(async () => {
      try {
        await incrementDownload(resourceId)
        window.open(fileUrl, "_blank", "noopener,noreferrer")
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Le telechargement a echoue."
        toast.error(message)
      }
    })
  }

  if (!isAuthenticated) {
    return (
      <Button size="lg" asChild className="flex-1 gap-2 sm:flex-none">
        <Link href="/login">
          <DownloadCloud className="h-5 w-5" />
          Se connecter pour telecharger
        </Link>
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      onClick={onDownload}
      disabled={isPending || !canDownload}
      className="flex-1 gap-2 sm:flex-none"
    >
      {isPending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Preparation...
        </>
      ) : (
        <>
          <DownloadCloud className="h-5 w-5" />
          Telecharger le {fileType}
        </>
      )}
    </Button>
  )
}
