import React from "react"
import styled from "@emotion/styled"
import NotionRenderer from "../components/NotionRenderer"
import { ExtendedRecordMap } from "notion-types"
type Props = {
  recordMap: ExtendedRecordMap
}

const PageDetail: React.FC<Props> = ({ recordMap }) => {
  if (!recordMap) return <div>Loading...</div>
  return (
    <StyledWrapper>
      <NotionRenderer recordMap={recordMap} />
    </StyledWrapper>
  )
}

export default PageDetail

const StyledWrapper = styled.div`
  margin: 0 auto;
  max-width: 56rem;
`
