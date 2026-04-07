"use client"

import * as React from "react"
import Link from "next/link"
import { Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { toggleFavorite } from "@/actions/resource-actions"
import { Button } from "@/components/ui/button"

type FavoriteButtonProps = {
  resourceId: string
  isAuthenticated: boolean
  initialIsFavorite: boolean
}

export function FavoriteButton({
  resourceId,
  isAuthenticated,
  initialIsFavorite,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = React.useState(initialIsFavorite)
  const [isPending, startTransition] = React.useTransition()

  const onToggle = () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour ajouter aux favoris.")
      return
    }

    startTransition(async () => {
      try {
        const result = await toggleFavorite(resourceId)
        setIsFavorite(result.isFavorite)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Impossible de mettre a jour le favori."
        toast.error(message)
      }
    })
  }

  if (!isAuthenticated) {
    return (
      <Button size="lg" variant="outline" asChild>
        <Link href="/login">
          <Heart className="h-5 w-5" />
        </Link>
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={onToggle}
      disabled={isPending}
      className={isFavorite ? "text-red-500" : ""}
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
      )}
    </Button>
  )
}
