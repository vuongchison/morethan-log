declare module "katex" {
  type RenderOptions = {
    displayMode?: boolean
    throwOnError?: boolean
    output?: "htmlAndMathml"
  }

  const katex: {
    renderToString(tex: string, options?: RenderOptions): string
  }

  export default katex
}