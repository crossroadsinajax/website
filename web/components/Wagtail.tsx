import React from "react"
import styled from "styled-components"

const _UserbarDiv = styled.div`
  bottom: 1em;
  right: 1em;
  position: fixed;
  z-index: 9999;
  display: block;
  font-size: 36px;
  cursor: pointer;
  height: 60px;
  width: 60px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.3);
  text-align: center;
  padding-top: 2px;
`

const Userbar: React.FC<{
  url: string
}> = ({ url }) => {
  return (
    <a href={url}>
      <_UserbarDiv>✏️</_UserbarDiv>
    </a>
  )
}

export { Userbar }
