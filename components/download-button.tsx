"use client"

import * as React from "react"
import { DownloadCloud, Loader2 } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { incrementDownload } from "@/actions/resource-actions"
import { Button } from "@/components/ui/button"

type DownloadButtonProps = {
  resourceId: string
  fileUrl: string
  canDownload: boolean
  fileType: string
}

export function DownloadButton({
  resourceId,
  fileUrl,
  canDownload,
  fileType,
}: DownloadButtonProps) {
  const { isSignedIn } = useAuth()
  const [isPending, startTransition] = React.useTransition()

  const onDownload = () => {
    if (!isSignedIn) {
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

  if (!isSignedIn) {
    return (
      <Button size="lg" variant="outline" disabled className="flex-1 gap-2 sm:flex-none">
        <DownloadCloud className="h-5 w-5" />
        Se connecter pour telecharger
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