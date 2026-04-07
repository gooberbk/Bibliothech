import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/auth"

const f = createUploadthing()

const isAdmin = async () => {
  const session = await auth()
  if (session?.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return { userId: session.user.id }
}

export const ourFileRouter = {
  coverImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(isAdmin)
    .onUploadComplete(async () => undefined),
  pdfDocument: f({
    pdf: {
      maxFileSize: "64MB",
      maxFileCount: 1,
    },
  })
    .middleware(isAdmin)
    .onUploadComplete(async () => undefined),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
