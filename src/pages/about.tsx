import { NextPageWithLayout } from "src/types"
import styled from "@emotion/styled"
import MetaConfig from "src/components/MetaConfig"
import { CONFIG } from "site.config"

const AboutPage: NextPageWithLayout = () => {
  return (
    <>
      <MetaConfig
        title="About"
        description="About page"
        type="Page"
        url={`${CONFIG.link}/about`}
      />
      <StyledWrapper>
        <h1>About</h1>
        <p>This is the about page.</p>
      </StyledWrapper>
    </>
  )
}

AboutPage.getLayout = (page) => {
  return <>{page}</>
}

export default AboutPage

const StyledWrapper = styled.div`
  padding: 2rem;
  max-width: 56rem;
  margin: 0 auto;
`
