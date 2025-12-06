import { NextApiRequest, NextApiResponse } from "next"
import { getRecordMap } from "src/apis"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { pageId } = req.query

  if (!pageId) {
    return res.status(400).json({ error: "pageId is required" })
  }

  try {
    const recordMap = await getRecordMap(pageId as string)
    res.status(200).json(recordMap)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recordMap" })
  }
}
