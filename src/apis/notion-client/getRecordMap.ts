import { getPageBlocks } from "./officialApi"

export const getRecordMap = async (pageId: string) => {
  return getPageBlocks(pageId)
}
