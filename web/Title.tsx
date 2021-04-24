import React from "react"
import { Helmet } from "react-helmet"

const Title: React.FC<{
  text: string
}> = ({ text }) => {
  return (
    <Helmet>
      <title>{text} - Crossroads</title>
    </Helmet>
  )
}

export default Title
