import React from "react"
import Container from "react-bootstrap/Container"
import WebSocketProvider from "./Websocket"

type HomeProps = {
  ws: WebSocketProvider
}

const Home: React.FC<HomeProps> = () => {
  return (
    <Container>
      <h1>Hello</h1>
    </Container>
  )
}

export default Home
