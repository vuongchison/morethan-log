import { FC, ReactNode } from "react"
import Image from "next/image"
import katex from "katex"
import styled from "@emotion/styled"
import { NotionBlock } from "src/apis/notion-client/officialApi"
import "katex/dist/katex.min.css"

type Props = {
  recordMap: NotionBlock[]
}

function renderMath(expression: string, displayMode = false) {
  const normalizedExpression = expression
    .replace(/\u00a0/g, " ")
    .replace(/\u200b/g, "")

  return katex.renderToString(normalizedExpression, {
    displayMode,
    throwOnError: false,
    output: "htmlAndMathml",
  })
}

function richText(items: any[] = []): ReactNode {
  return items.map((item, index) => {
    if (item.type === "equation") {
      return (
        <span
          key={item.id ?? index}
          dangerouslySetInnerHTML={{
            __html: renderMath(item.equation?.expression ?? ""),
          }}
        />
      )
    }

    const annotations = item.annotations ?? {}
    let content: ReactNode = item.plain_text ?? item.text?.content ?? ""

    if (annotations.code) content = <code>{content}</code>
    if (annotations.bold) content = <strong>{content}</strong>
    if (annotations.italic) content = <em>{content}</em>
    if (annotations.strikethrough) content = <s>{content}</s>
    if (annotations.underline) content = <u>{content}</u>
    if (item.href) {
      content = (
        <a href={item.href} target="_blank" rel="noreferrer">
          {content}
        </a>
      )
    }

    return <span key={item.id ?? index}>{content}</span>
  })
}

function blockText(block: NotionBlock) {
  return block[block.type]?.rich_text ?? []
}

function blockChildren(block: NotionBlock): ReactNode {
  return block.children?.length ? <Blocks blocks={block.children} /> : null
}

function renderBlock(block: NotionBlock): ReactNode {
  const data = block[block.type] ?? {}
  const text = richText(data.rich_text)
  const children = blockChildren(block)

  switch (block.type) {
    case "paragraph":
      return <p>{text || <br />}{children}</p>
    case "heading_1":
      return <h1>{text}</h1>
    case "heading_2":
      return <h2>{text}</h2>
    case "heading_3":
      return <h3>{text}</h3>
    case "bulleted_list_item":
    case "numbered_list_item":
      return <li>{text}{children}</li>
    case "quote":
      return <blockquote>{text}{children}</blockquote>
    case "callout":
      return <aside>{data.icon?.emoji && <span>{data.icon.emoji} </span>}{text}{children}</aside>
    case "divider":
      return <hr />
    case "code":
      return <pre><code>{blockText(block).map((item: any) => item.plain_text).join("")}</code></pre>
    case "image": {
      const url = data.file?.url ?? data.external?.url
      const caption = data.caption?.map((item: any) => item.plain_text).join("") ?? ""
      return url ? <figure><Image src={url} alt={caption} width={1200} height={800} unoptimized style={{ width: "100%", height: "auto" }} />{caption && <figcaption>{richText(data.caption)}</figcaption>}</figure> : null
    }
    case "video":
    case "file":
    case "pdf": {
      const media = data.file ?? data.external
      return media?.url ? <p><a href={media.url} target="_blank" rel="noreferrer">{richText(data.caption) || media.name || `Open ${block.type}`}</a></p> : null
    }
    case "bookmark":
      return <p><a href={data.url} target="_blank" rel="noreferrer">{data.url}</a></p>
    case "embed":
      return <p><a href={data.url} target="_blank" rel="noreferrer">{data.url}</a></p>
    case "equation":
      return (
        <div
          className="display-equation"
          dangerouslySetInnerHTML={{
            __html: renderMath(data.expression ?? "", true),
          }}
        />
      )
    case "toggle":
      return <details><summary>{text}</summary>{children}</details>
    case "child_page":
      return <h2>{data.title}</h2>
    case "table":
      return <table><tbody>{block.children?.map((row) => renderBlock(row))}</tbody></table>
    case "table_row":
      return <tr>{data.cells?.map((cell: any[], index: number) => <td key={index}>{richText(cell)}</td>)}</tr>
    case "column_list":
      return <div className="columns">{children}</div>
    case "column":
      return <div>{children}</div>
    case "child_database":
      return <p>{data.title}</p>
    default:
      return children
  }
}

function Blocks({ blocks }: { blocks: NotionBlock[] }) {
  const output: ReactNode[] = []

  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index]
    if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
      const listType = block.type
      const list: NotionBlock[] = []
      while (blocks[index]?.type === listType) {
        list.push(blocks[index])
        index++
      }
      index--
      const List = listType === "bulleted_list_item" ? "ul" : "ol"
      output.push(<List key={block.id}>{list.map((item) => <li key={item.id}>{richText(item[listType]?.rich_text)}{blockChildren(item)}</li>)}</List>)
    } else {
      output.push(<div className={`notion-block notion-${block.type}`} key={block.id}>{renderBlock(block)}</div>)
    }
  }

  return <>{output}</>
}

const NotionRenderer: FC<Props> = ({ recordMap }) => (
  <StyledWrapper><Blocks blocks={recordMap ?? []} /></StyledWrapper>
)

export default NotionRenderer

const StyledWrapper = styled.div`
  font-family: "Latin Modern Roman", serif;
  line-height: 1.7;

  p, h1, h2, h3, blockquote, ul, ol, figure, pre, table, aside {
    margin: 0 0 1rem;
  }

  h1, h2, h3 { line-height: 1.25; }
  h1 { font-size: 1.8rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.2rem; }
  ul, ol { padding-left: 1.5rem; }
  blockquote { border-left: 3px solid #888; padding-left: 1rem; }
  aside { padding: 0.75rem 1rem; background: rgba(127, 127, 127, 0.12); }
  img { display: block; max-width: 100%; height: auto; margin: 0 auto; }
  figcaption { text-align: center; opacity: 0.75; font-size: 0.9rem; }
  pre { overflow-x: auto; padding: 1rem; background: rgba(127, 127, 127, 0.12); }
  .display-equation { overflow-x: auto; text-align: center; }
  table { width: 100%; border-collapse: collapse; }
  td { border: 1px solid rgba(127, 127, 127, 0.4); padding: 0.5rem; }
  .columns { display: flex; gap: 1.5rem; }
  .columns > div { min-width: 0; flex: 1; }
  @media (max-width: 640px) { .columns { display: block; } }
`