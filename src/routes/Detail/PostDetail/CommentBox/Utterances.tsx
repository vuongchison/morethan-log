import { CONFIG } from "site.config"
import { useEffect, useRef } from "react"
import styled from "@emotion/styled"
import useScheme from "src/hooks/useScheme"
import { useRouter } from "next/router"

type Props = {
  issueTerm: string
}

const Utterances: React.FC<Props> = ({ issueTerm }) => {
  const [scheme] = useScheme()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const theme = `github-${scheme}`
    const script = document.createElement("script")

    script.src = "https://utteranc.es/client.js"
    script.async = true
    script.crossOrigin = "anonymous"
    script.setAttribute("issue-term", issueTerm)
    script.setAttribute("theme", theme)

    const config: Record<string, string> = CONFIG.utterances.config
    Object.keys(config).forEach((key) => {
      script.setAttribute(key, config[key])
    })

    ref.current.appendChild(script)

    return () => {
      ref.current?.removeChild(script)
    }
  }, [issueTerm, router])

  useEffect(() => {
    const iframe =
      document.querySelector<HTMLIFrameElement>(".utterances-frame")
    if (!iframe) return

    const theme = `github-${scheme}`
    const message = {
      type: "set-theme",
      theme: theme,
    }
    iframe.contentWindow?.postMessage(message, "https://utteranc.es")
  }, [scheme])

  return (
    <>
      <StyledWrapper ref={ref} id="comments" />
    </>
  )
}

export default Utterances

const StyledWrapper = styled.div`
  @media (min-width: 768px) {
    margin-left: -4rem;
  }
`
