import { gql } from "@apollo/client"
import React from "react"
import Col from "react-bootstrap/Col"
import Container from "react-bootstrap/Container"
import ResponsiveEmbed from "react-bootstrap/ResponsiveEmbed"
import Row from "react-bootstrap/Row"
import Spinner from "react-bootstrap/Spinner"
import ReactPlayer from "react-player/youtube"
import { Link, useParams } from "react-router-dom"
import styled from "styled-components"
import { ServicePageNode, UserType } from "~/generated-types"
import { Maybe } from "~/types"
import WebSocketProvider, { WSMessage } from "~Websocket"

import { Error } from "./Error"
import Title from "./Title"
import { Bulletin } from "./components/Bulletin"
import Chat from "./components/Chat"
import { Userbar } from "./components/Wagtail"
import { useServicePageQuery } from "./generated-types"

gql`
  query ServicePage($slug: String!) {
    services(slug: $slug) {
      edges {
        node {
          bulletin
          date
          editUrl
          id
          pk
          slug
          title
          description
          streamLink
        }
      }
    }
  }
`

const VideoCol = styled(Col)`
  display: flex;
  justify-content: center;
  @media (max-width: 768px) {
    padding-left: unset;
  }
  @media (min-width: 768px) {
    padding-left: 5px;
  }
  padding-right: unset;
`

const ChatCol = styled(Col)`
  padding-right: 5px !important;
  padding-left: 5px;
  min-height: 400px;
`

interface ServiceProps {
  ws: WebSocketProvider
  user: Maybe<UserType>
  page: ServicePageNode
  refetch: () => void
}

export type ServiceLayout = "stream" | "poll"

type ServiceState = {
  videoWidth: number
  chatWidth: number // videoWidth + chatWidth = 12
  layout: ServiceLayout
}

class Service extends React.Component<ServiceProps, ServiceState> {
  state: ServiceState = {
    videoWidth: 8,
    chatWidth: 4,
    layout: "stream",
  }

  constructor(props: ServiceProps) {
    super(props)
  }

  componentDidMount() {
    const { ws } = this.props
    ws.registerOnOpen(this.onConnect)
    ws.registerOnMessage(this.onMessage)
  }

  componentWillUnmount() {
    const { ws } = this.props
    ws.deregisterOnOpen(this.onConnect)
    ws.deregisterOnMessage(this.onMessage)
    ws.send({
      type: "service.disconnect",
    })
  }

  setLayout = (layout: ServiceLayout) => {
    let videoWidth = 8,
      chatWidth = 4
    if (layout == "poll") {
      videoWidth = 5
      chatWidth = 7
    }
    this.setState({
      layout,
      videoWidth,
      chatWidth,
    })
  }

  onConnect = () => {
    const { page, ws } = this.props
    ws.send({
      type: "service.connect",
      id: page.pk,
    })
  }

  onMessage = (msg: WSMessage) => {
    if (msg.type == "service.update") {
      this.props.refetch()
    }
  }

  render() {
    const { page, user, ws } = this.props
    const { videoWidth, chatWidth, layout } = this.state

    if (!user) {
      return (
        <Container>
          <h1>
            Please <Link to="/signup">sign up</Link> to see our services or
            check your email for access.
          </h1>
        </Container>
      )
    }
    return (
      <Container fluid>
        {page.editUrl && <Userbar url={page.editUrl} />}
        <Row>
          <VideoCol className="f-center" md={videoWidth}>
            {page.streamLink && (
              <ResponsiveEmbed aspectRatio="16by9">
                <ReactPlayer
                  width="100%"
                  height="100%"
                  url={page.streamLink}
                  playing={true}
                  controls={true}
                />
              </ResponsiveEmbed>
            )}
            {!page.streamLink && (
              <h2 style={{ alignSelf: "center" }}>
                The stream will load automatically
              </h2>
            )}
          </VideoCol>
          <ChatCol md={chatWidth}>
            {user && (
              <Chat
                layout={layout}
                setLayout={this.setLayout}
                user={user}
                id={page.pk}
                ws={ws}
              />
            )}
          </ChatCol>
        </Row>
        <h2>{page.title}</h2>
        <p className="meta">{page.date}</p>
        <div dangerouslySetInnerHTML={{ __html: page.description }} />
        {user && <Bulletin bulletinStr={page.bulletin} />}
      </Container>
    )
  }
}

interface ServicePageProps {
  user: Maybe<UserType>
  ws: WebSocketProvider
}

const ServicePage: React.FC<ServicePageProps> = ({ user, ws }) => {
  let { slug } = useParams<{
    slug: string
  }>()
  const { data, loading, refetch } = useServicePageQuery({
    variables: {
      slug,
    },
  })

  const page = data?.services?.edges?.[0]?.node

  if (page) {
    return (
      <>
        <Title text={page.title} />
        <Service
          user={user}
          ws={ws}
          page={page}
          refetch={() => {
            refetch()
          }}
        />
      </>
    )
  } else if (loading) {
    return <Spinner animation="border"></Spinner>
  } else {
    return <Error />
  }
}

export { ServicePage }
