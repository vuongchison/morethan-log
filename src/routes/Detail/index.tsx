import useMermaidEffect from "./hooks/useMermaidEffect"
import PostDetail from "./PostDetail"
import PageDetail from "./PageDetail"
import styled from "@emotion/styled"
import usePostQuery from "src/hooks/usePostQuery"
import useRecordMapQuery from "src/hooks/useRecordMapQuery"
import { NotionRenderer } from "react-notion-x"

type Props = {}

const Detail: React.FC<Props> = () => {
  const post = usePostQuery()
  const { data: recordMap } = useRecordMapQuery(post?.id || "")
  useMermaidEffect()

  if (!post) return null
  return (
    <StyledWrapper data-type={post.type}>
      {post.type[0] === "Page" && <PageDetail recordMap={recordMap} />}
      {post.type[0] !== "Page" && <PostDetail recordMap={recordMap} />}
    </StyledWrapper>
  )
}

export default Detail

const StyledWrapper = styled.div`
  padding: 2rem 0;

  &[data-type="Paper"] {
    padding: 40px 0;
  }
  /** Reference: https://github.com/chriskempson/tomorrow-theme **/
  code[class*="language-mermaid"],
  pre[class*="language-mermaid"] {
    background-color: ${({ theme }) => theme.colors.gray5};
  }
`
