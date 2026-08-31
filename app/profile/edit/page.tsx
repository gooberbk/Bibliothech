"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, User, Linkedin, Github, Twitter, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile } from "@/actions/profile-actions"
import { toast } from "sonner"

type SocialLinks = {
  linkedin?: string
  github?: string
  twitter?: string
  website?: string
}

type AcademicInfo = {
  university?: string
  degree?: string
  field?: string
  year?: string
}

export default function ProfileEditPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [profile, setProfile] = React.useState({
    bio: "",
    socialLinks: {} as SocialLinks,
    academicInfo: {} as AcademicInfo,
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const loadProfile = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/profile")
      if (!response.ok) throw new Error("Impossible de charger le profil")
      const data = await response.json()
      setProfile({
        bio: data.bio || "",
        socialLinks: data.socialLinks ? JSON.parse(data.socialLinks) : {},
        academicInfo: data.academicInfo ? JSON.parse(data.academicInfo) : {},
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Une erreur est survenue."
      toast.error(message)
      // Don't block the form if profile loading fails, just use empty values
      setProfile({
        bio: "",
        socialLinks: {},
        academicInfo: {},
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (profile.bio.length > 500) {
      newErrors.bio = "La bio ne doit pas dépasser 500 caractères"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSaving(true)
    const loadingToastId = toast.loading("Mise à jour du profil...")

    try {
      await updateProfile({
        bio: profile.bio.trim(),
        socialLinks: JSON.stringify(profile.socialLinks),
        academicInfo: JSON.stringify(profile.academicInfo),
      })

      toast.dismiss(loadingToastId)
      toast.success("Profil mis à jour avec succès !")
      router.push("/profile")
      router.refresh()
    } catch (error) {
      toast.dismiss(loadingToastId)
      const message = error instanceof Error ? error.message : "Une erreur est survenue."
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Modifier le profil</h1>
            <p className="mt-1 text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier le profil</h1>
          <p className="mt-1 text-muted-foreground">
            Mettez à jour vos informations personnelles
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Bio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez-nous un peu de vous..."
                    rows={5}
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    className={errors.bio ? "border-destructive" : ""}
                    maxLength={500}
                  />
                  <div className="flex justify-between">
                    {errors.bio && (
                      <p className="text-xs text-destructive">{errors.bio}</p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {profile.bio.length}/500
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5" />
                  Liens sociaux
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/votre-profil"
                    value={profile.socialLinks.linkedin || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, linkedin: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    placeholder="https://github.com/votre-username"
                    value={profile.socialLinks.github || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, github: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/votre-username"
                    value={profile.socialLinks.twitter || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, twitter: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    placeholder="https://votre-site.com"
                    value={profile.socialLinks.website || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, website: e.target.value },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Informations académiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="university">Université</Label>
                    <Input
                      id="university"
                      placeholder="Ex: Université de Paris"
                      value={profile.academicInfo.university || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          academicInfo: { ...profile.academicInfo, university: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degree">Diplôme</Label>
                    <Input
                      id="degree"
                      placeholder="Ex: Licence, Master, Doctorat"
                      value={profile.academicInfo.degree || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          academicInfo: { ...profile.academicInfo, degree: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="field">Domaine d'études</Label>
                    <Input
                      id="field"
                      placeholder="Ex: Informatique, Mathématiques"
                      value={profile.academicInfo.field || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          academicInfo: { ...profile.academicInfo, field: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Année d'obtention</Label>
                    <Input
                      id="year"
                      placeholder="Ex: 2024"
                      value={profile.academicInfo.year || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          academicInfo: { ...profile.academicInfo, year: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer les modifications"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
