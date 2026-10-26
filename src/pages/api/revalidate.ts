import { NextApiRequest, NextApiResponse } from "next"
import { getPosts } from "../../apis"
import { invalidateNotionCache } from "../../apis/notion-client/officialApi"

// for all path revalidate, https://<your-site.com>/api/revalidate?secret=<token>
// for specific path revalidate, https://<your-site.com>/api/revalidate?secret=<token>&path=<path>
// example, https://<your-site.com>/api/revalidate?secret=이것은_키&path=feed
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { secret, path } = req.query
  const revalidateToken = process.env.TOKEN_FOR_REVALIDATE
  if (!revalidateToken || secret !== revalidateToken) {
    return res.status(401).json({ message: "Invalid token" })
  }

  try {
    invalidateNotionCache()

    if (path && typeof path === "string") {
      await res.revalidate(path)
    } else {
      const posts = await getPosts()
      const paths = new Set(["/", ...posts.map((row) => `/${row.slug}`)])
      const revalidateRequests = [...paths].map((pagePath) =>
        res.revalidate(pagePath)
      )
      await Promise.all(revalidateRequests)
    }

    res.json({ revalidated: true })
  } catch (err) {
    return res.status(500).send("Error revalidating")
  }
}
