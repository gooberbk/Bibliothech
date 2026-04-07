import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import type { Role } from "@prisma/client"
import { z } from "zod"
import { db } from "@/lib/db"

const signInSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe invalide"),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = signInSchema.safeParse(rawCredentials)
        if (!parsed.success) return null

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user?.password) return null
        const isValid = await compare(parsed.data.password, user.password)
        if (!isValid) return null

        return user
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const role = (user as { role?: Role }).role ?? "USER"
      if (session.user) {
        session.user.id = user.id
        session.user.role = role
      }
      return session
    },
  },
})
