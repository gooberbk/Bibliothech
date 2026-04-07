import Link from "next/link"
import { Library } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-primary" />
            <span className="font-semibold">Biblio ESTIN</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link 
              href="/mentions-legales" 
              className="transition-colors hover:text-foreground"
            >
              Mentions Légales
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link 
              href="/signaler" 
              className="transition-colors hover:text-foreground"
            >
              Signaler un problème
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Plateforme non-officielle créée par des étudiants pour les étudiants de l&apos;ESTIN.
            <br className="hidden sm:inline" />
            Les documents restent la propriété intellectuelle de leurs auteurs.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Biblio ESTIN. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
