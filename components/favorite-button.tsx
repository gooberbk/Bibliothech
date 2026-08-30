"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type FavoriteButtonProps = {
  resourceId: string
  initialIsFavorite: boolean
}

export function FavoriteButton({
  resourceId,
  initialIsFavorite,
}: FavoriteButtonProps) {
  const onToggle = () => {
    toast.error("Authentification non implémentée")
  }

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={onToggle}
      disabled
    >
      <Heart className="h-5 w-5" />
    </Button>
  )
}
