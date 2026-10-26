const NOTION_API_BASE = "https://api.notion.com/v1"
const NOTION_API_VERSION = "2025-09-03"
const PAGE_CACHE_TTL = 45 * 60 * 1000
const DATABASE_CACHE_TTL = 5 * 60 * 1000
const MAX_CONCURRENT_REQUESTS = 4

type CacheEntry<T> = {
  expiresAt: number
  promise: Promise<T>
}

const pageCache = new Map<string, CacheEntry<NotionBlock[]>>()
const databaseCache = new Map<string, CacheEntry<any[]>>()
const requestQueue: Array<() => void> = []
let activeRequests = 0

export type NotionBlock = {
  id: string
  type: string
  has_children?: boolean
  children?: NotionBlock[]
  [key: string]: any
}

class NotionApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
    this.name = "NotionApiError"
  }
}

function cached<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  ttl: number,
  loader: () => Promise<T>
) {
  const existing = cache.get(key)
  if (existing && existing.expiresAt > Date.now()) return existing.promise
  if (existing) cache.delete(key)

  const promise = loader().catch((error) => {
    if (cache.get(key)?.promise === promise) cache.delete(key)
    throw error
  })
  cache.set(key, { expiresAt: Date.now() + ttl, promise })
  return promise
}

async function withRequestSlot<T>(request: () => Promise<T>): Promise<T> {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    await new Promise<void>((resolve) => requestQueue.push(resolve))
  } else {
    activeRequests++
  }

  try {
    return await request()
  } finally {
    const nextRequest = requestQueue.shift()
    if (nextRequest) nextRequest()
    else activeRequests--
  }
}

export function invalidateNotionCache() {
  pageCache.clear()
  databaseCache.clear()
}

function getHeaders() {
  const token = process.env.NOTION_API_KEY
  if (!token) {
    throw new Error("NOTION_API_KEY is required to access the official Notion API")
  }

  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_API_VERSION,
    "Content-Type": "application/json",
  }
}

async function notionRequest<T>(path: string, body?: object): Promise<T> {
  const response = await withRequestSlot(() =>
    fetch(`${NOTION_API_BASE}${path}`, {
      method: body ? "POST" : "GET",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
  )

  if (!response.ok) {
    const details = await response.json().catch(() => null)
    const message = details?.message || response.statusText
    if (response.status === 401 || response.status === 403 || response.status === 404) {
      throw new NotionApiError(
        response.status,
        `Notion API returned ${response.status}: ${message}. Check NOTION_API_KEY and invite the integration to the page or database.`
      )
    }
    throw new NotionApiError(response.status, `Notion API returned ${response.status}: ${message}`)
  }

  return response.json() as Promise<T>
}

async function getAllResults<T>(path: string, body?: object) {
  const results: T[] = []
  let startCursor: string | undefined

  do {
    const separator = path.includes("?") ? "&" : "?"
    const requestPath =
      !body && startCursor
        ? `${path}${separator}start_cursor=${encodeURIComponent(startCursor)}`
        : path
    const requestBody = body
      ? { ...body, ...(startCursor ? { start_cursor: startCursor } : {}) }
      : undefined
    const response = await notionRequest<{
      results: T[]
      has_more: boolean
      next_cursor: string | null
    }>(requestPath, requestBody)
    results.push(...response.results)
    startCursor = response.has_more ? response.next_cursor ?? undefined : undefined
  } while (startCursor)

  return results
}

async function getDataSourceId(databaseId: string) {
  const database = await notionRequest<{
    data_sources?: { id: string }[]
  }>(`/databases/${databaseId}`)
  const dataSourceId = database.data_sources?.[0]?.id
  if (!dataSourceId) {
    throw new Error(`No data source found in Notion database ${databaseId}`)
  }
  return dataSourceId
}

export async function queryDatabase(databaseId: string) {
  return cached(databaseCache, databaseId, DATABASE_CACHE_TTL, async () => {
    return queryDatabaseUncached(databaseId)
  })
}

async function queryDatabaseUncached(databaseId: string) {
  let dataSourceId: string
  try {
    dataSourceId = await getDataSourceId(databaseId)
  } catch (error) {
    if (!(error instanceof NotionApiError) || error.status !== 404) throw error
    const blocks = await getPageBlocks(databaseId)
    const findDatabase = (items: NotionBlock[]): NotionBlock | undefined => {
      for (const block of items) {
        if (block.type === "child_database") return block
        const nested = block.children && findDatabase(block.children)
        if (nested) return nested
      }
      return undefined
    }
    const databaseBlock = findDatabase(blocks)
    if (!databaseBlock) {
      throw new Error(
        "Could not find a database for NOTION_DATABASE_ID. Set it to the database ID, not a view ID, or share a page containing the database."
      )
    }
    dataSourceId = await getDataSourceId(databaseBlock.id)
  }
  return getAllResults<any>(`/data_sources/${dataSourceId}/query`, {})
}

export async function getPageBlocks(pageId: string): Promise<NotionBlock[]> {
  return cached(pageCache, pageId, PAGE_CACHE_TTL, () => getPageBlocksUncached(pageId))
}

async function getPageBlocksUncached(pageId: string): Promise<NotionBlock[]> {
  const blocks = await getAllResults<NotionBlock>(
    `/blocks/${pageId}/children?page_size=100`
  )

  await Promise.all(
    blocks
      .filter((block) => block.has_children)
      .map(async (block) => {
        block.children = await getPageBlocks(block.id)
      })
  )

  return blocks
}

function plainText(value: any): string {
  if (!value) return ""
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.map(plainText).join("")
  return value.plain_text ?? value.name ?? ""
}

function propertyValue(property: any): any {
  if (!property) return undefined
  switch (property.type) {
    case "title":
    case "rich_text":
      return plainText(property[property.type])
    case "date":
      return property.date
    case "select":
    case "status":
      return property[property.type]?.name
    case "multi_select":
      return property.multi_select?.map((item: any) => item.name) ?? []
    case "people":
      return property.people?.map((person: any) => ({
        id: person.id,
        name: person.name,
        profile_photo: person.avatar_url,
      })) ?? []
    case "files": {
      const file = property.files?.[0]
      return file?.file?.url || file?.external?.url
    }
    case "url":
      return property.url
    case "number":
      return property.number
    case "checkbox":
      return property.checkbox
    case "email":
      return property.email
    case "phone_number":
      return property.phone_number
    case "formula":
      return propertyValue(property.formula)
    case "string":
      return property.string
    case "boolean":
      return property.boolean
    default:
      return undefined
  }
}

function findProperty(properties: Record<string, any>, name: string) {
  const key = Object.keys(properties).find(
    (propertyName) => propertyName.toLowerCase() === name
  )
  return key ? properties[key] : undefined
}

export function mapDatabasePage(page: any) {
  const properties = page.properties ?? {}
  const titleProperty = Object.values(properties).find(
    (property: any) => property.type === "title"
  ) as any
  const title = plainText(titleProperty?.title)
  const mapped: Record<string, any> = {
    id: page.id,
    title,
    createdTime: page.created_time,
    fullWidth: false,
  }

  for (const name of ["slug", "summary", "date", "type", "tags", "category", "status", "author", "thumbnail"]) {
    const value = propertyValue(findProperty(properties, name))
    if (value !== undefined) mapped[name] = value
  }

  if (typeof mapped.type === "string") mapped.type = [mapped.type]
  if (typeof mapped.tags === "string") mapped.tags = [mapped.tags]
  if (typeof mapped.status === "string") mapped.status = [mapped.status]
  if (typeof mapped.category === "string") mapped.category = [mapped.category]

  return mapped
}