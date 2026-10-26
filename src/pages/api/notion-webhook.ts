import { createHmac, timingSafeEqual } from "crypto"
import { NextApiRequest, NextApiResponse } from "next"
import { getPosts } from "src/apis"
import { invalidateNotionCache } from "src/apis/notion-client/officialApi"

const MAX_BODY_SIZE = 1024 * 1024

async function readRawBody(req: NextApiRequest) {
  const chunks: Buffer[] = []
  let size = 0

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > MAX_BODY_SIZE) throw new Error("Webhook payload too large")
    chunks.push(buffer)
  }

  return Buffer.concat(chunks)
}

function isValidSignature(body: Buffer, signature: string, token: string) {
  const expected = `sha256=${createHmac("sha256", token).update(body).digest("hex")}`
  const expectedBuffer = Buffer.from(expected)
  const receivedBuffer = Buffer.from(signature)

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  )
}

async function revalidateNotionPages(res: NextApiResponse) {
  invalidateNotionCache()

  const posts = await getPosts()
  const paths = new Set(["/", "/sitemap.xml", ...posts.map((post) => `/${post.slug}`)])
  await Promise.all([...paths].map((path) => res.revalidate(path)))
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ message: "Method not allowed" })
  }

  let rawBody: Buffer
  let payload: any
  try {
    rawBody = await readRawBody(req)
    payload = JSON.parse(rawBody.toString("utf8"))
  } catch {
    return res.status(400).json({ message: "Invalid webhook payload" })
  }

  if (typeof payload.verification_token === "string" && !payload.type) {
    if (process.env.NOTION_WEBHOOK_LOG_CHALLENGE === "true") {
      console.info("Notion webhook verification token:", payload.verification_token)
    }
    res.setHeader("X-Notion-Verification-Token", payload.verification_token)
    return res.status(200).json({
      received: true,
      verification_token: payload.verification_token,
    })
  }

  const verificationToken = process.env.NOTION_WEBHOOK_VERIFICATION_TOKEN
  const signature = req.headers["x-notion-signature"]
  if (
    !verificationToken ||
    typeof signature !== "string" ||
    !isValidSignature(rawBody, signature, verificationToken)
  ) {
    return res.status(401).json({ message: "Invalid webhook signature" })
  }

  try {
    await revalidateNotionPages(res)
    return res.status(200).json({ received: true, revalidated: true })
  } catch (error) {
    console.error("Notion webhook revalidation failed", error)
    return res.status(500).json({ message: "Failed to revalidate Notion content" })
  }
}