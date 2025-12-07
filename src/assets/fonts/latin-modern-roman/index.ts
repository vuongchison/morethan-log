// src/assets/fonts/latin-modern-roman/index.ts
import localFont from "next/font/local"

export const latinModernRoman = localFont({
  src: [
    {
      path: "../../../../public/fonts/latin-modern-roman/lmroman10-regular.otf",
      weight: "normal",
      style: "normal",
    },
    {
      path: "../../../../public/fonts/latin-modern-roman/lmroman10-italic.otf",
      weight: "normal",
      style: "italic",
    },
    {
      path: "../../../../public/fonts/latin-modern-roman/lmroman10-bold.otf",
      weight: "bold",
      style: "normal",
    },
    {
      path: "../../../../public/fonts/latin-modern-roman/lmroman10-bolditalic.otf",
      weight: "bold",
      style: "italic",
    },
  ],
})
