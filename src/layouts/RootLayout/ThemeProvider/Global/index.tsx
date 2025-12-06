import { Global as _Global, css, useTheme } from "@emotion/react"

import { ThemeProvider as _ThemeProvider } from "@emotion/react"
import { bitstreamCharter } from "src/assets"

export const Global = () => {
  const theme = useTheme()

  return (
    <_Global
      styles={css`
        @font-face {
          font-family: "Bitstream Charter";
          src: url("/fonts/bitstream-charter/Charter Regular.otf") format("opentype");
          font-weight: normal;
          font-style: normal;
        }
        @font-face {
          font-family: "Bitstream Charter";
          src: url("/fonts/bitstream-charter/Charter Italic.otf") format("opentype");
          font-weight: normal;
          font-style: italic;
        }
        @font-face {
          font-family: "Bitstream Charter";
          src: url("/fonts/bitstream-charter/Charter Bold.otf") format("opentype");
          font-weight: bold;
          font-style: normal;
        }
        @font-face {
          font-family: "Bitstream Charter";
          src: url("/fonts/bitstream-charter/Charter Bold Italic.otf") format("opentype");
          font-weight: bold;
          font-style: italic;
        }

        body {
          margin: 0;
          padding: 0;
          color: ${theme.colors.gray12};
          background-color: ${theme.colors.gray2};
          font-family: ${bitstreamCharter.style.fontFamily};
          font-weight: ${bitstreamCharter.style.fontWeight};
          font-style: ${bitstreamCharter.style.fontStyle};
          text-align: justify;
          text-justify: inter-word;

          word-break: normal;
          overflow-wrap: normal;
          hyphens: manual;
        }

        * {
          color-scheme: ${theme.scheme};
          box-sizing: border-box;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          margin: 0;
          font-weight: inherit;
          font-style: inherit;
        }

        a {
          all: unset;
          cursor: pointer;
        }

        ul {
          padding: 0;
        }

        // init button
        button {
          all: unset;
          cursor: pointer;
        }

        // init input
        input {
          all: unset;
          box-sizing: border-box;
        }

        // init textarea
        textarea {
          border: none;
          background-color: transparent;
          font-family: inherit;
          padding: 0;
          outline: none;
          resize: none;
          color: inherit;
        }

        hr {
          width: 100%;
          border: none;
          margin: 0;
          border-top: 1px solid ${theme.colors.gray6};
        }
      `}
    />
  )
}
