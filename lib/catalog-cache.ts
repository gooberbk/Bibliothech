import { unstable_cache } from "next/cache"
import { db } from "@/lib/db"

export const getResourcesListCached = unstable_cache(
  async () =>
    db.resource.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ["resources-list-cache-key"],
  { tags: ["resources-list"] }
)
