import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

const isAdmin = async () => {
  // For now, skip admin check since auth is not implemented
  return { userId: "admin" }
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
