export const queryKey = {
  scheme: () => ["scheme"],
  posts: () => ["posts"],
  tags: () => ["tags"],
  categories: () => ["categories"],
  post: (slug: string) => ["post", slug],
  recordMap: (pageId: string) => ["recordMap", pageId],
}
