import { useQuery } from "@tanstack/react-query"
import { queryKey } from "src/constants/queryKey"

const fetchRecordMap = async (pageId: string) => {
  const res = await fetch(`/api/get-record-map?pageId=${pageId}`)
  if (!res.ok) {
    throw new Error("Failed to fetch recordMap")
  }
  return res.json()
}

const useRecordMapQuery = (pageId: string) => {
  return useQuery(queryKey.recordMap(pageId), () => fetchRecordMap(pageId), {
    enabled: !!pageId,
  })
}

export default useRecordMapQuery
