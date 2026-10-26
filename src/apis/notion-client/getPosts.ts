import { CONFIG } from "site.config"
import { mapDatabasePage, queryDatabase } from "./officialApi"
import { TPosts } from "src/types"

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */

// TODO: react query를 사용해서 처음 불러온 뒤로는 해당데이터만 사용하도록 수정
export const getPosts = async () => {
  const databaseId = CONFIG.notionConfig.databaseId
  if (!databaseId) {
    throw new Error("NOTION_DATABASE_ID is required to load blog posts")
  }

  const posts = (await queryDatabase(databaseId)).map(mapDatabasePage)
  posts.sort((a: any, b: any) => {
    const dateA = new Date(a.date?.start_date || a.createdTime).getTime()
    const dateB = new Date(b.date?.start_date || b.createdTime).getTime()
    return dateB - dateA
  })

  return posts as TPosts
}
