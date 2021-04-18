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
import Chat from "./components/Chat"
import { useServicePageQuery, useServicePagesQuery } from "./generated-types"

gql`
  query ServicePage($slug: String!) {
    services(slug: $slug) {
      edges {
        node {
          bulletin
          date
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

gql`
  query ServicePages {
    services {
      edges {
        node {
          slug
          title
          description
        }
      }
    }
  }
`

const VideoCol = styled(Col)`
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

class Service extends React.Component<ServiceProps, {}> {
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
    return (
      <Container fluid>
        <Row>
          <VideoCol md={9}>
            <ResponsiveEmbed aspectRatio="16by9">
              <ReactPlayer
                width="100%"
                height="100%"
                url={page.streamLink}
                playing={true}
                controls={true}
              />
            </ResponsiveEmbed>
          </VideoCol>
          <ChatCol md={3}>
            {user && <Chat user={user} id={page.pk} ws={ws} />}
          </ChatCol>
        </Row>
        <h2>{page.title}</h2>
        <p className="meta">{page.date}</p>
        <div dangerouslySetInnerHTML={{ __html: page.description }} />
        <div>{page.bulletin}</div>
      </Container>
    )
  }
}

interface ServicePageProps {
  user: Maybe<UserType>
  ws: WebSocketProvider
}

const ServicePage: React.FC<ServicePageProps> = ({ user, ws }) => {
  let { slug } = useParams()
  const { data, loading, refetch } = useServicePageQuery({
    variables: {
      slug,
    },
  })

  const page = data?.services?.edges?.[0]?.node

  if (page) {
    return (
      <Service
        user={user}
        ws={ws}
        page={page}
        refetch={() => {
          refetch()
        }}
      />
    )
  } else if (loading) {
    return <Spinner animation="border"></Spinner>
  } else {
    return <Error />
  }
}

type ServicesProps = {}

const Services: React.FC<ServicesProps> = () => {
  const { data, loading } = useServicePagesQuery({
    variables: {},
  })

  if (!window.SETTINGS.PROD) {
    console.log(loading, data)
  }
  const pages = data?.services?.edges
  let listing
  if (pages) {
    listing = (
      <>
        <ul>
          {pages.map((page: any, i: number) => (
            <li key={i}>
              <Link to={`/gathering/${page.node.slug}`}>{page.node.title}</Link>
            </li>
          ))}
        </ul>
      </>
    )
  } else {
    listing = <Spinner animation="border"></Spinner>
  }

  return (
    <Container>
      <h1>Sunday Gatherings</h1>
      <p>
        We gather every Sunday as a community to be encouraged and reminded that
        we are not alone. Through praying, singing, sharing, learning,
        discussing and laughing together, our Sunday gatherings connect us to
        God and to each other, giving us a boost for the week to come!
      </p>
      <p>
        Some of the values that mark our gatherings include:
        <br />
        <br />
        <b>Informal:</b> Come as you are, not as you are ‘expected’ to be!
        <br />
        <b>Participatory:</b> Feel free to join the conversation, your voice is
        welcome!
        <br />
        <b>Authentic:</b> We want it to be real, not religious!
        <br />
        <b>Relevant:</b> Connecting God to the real stuff of your life!
        <br />
        <br />
        During COVID-19 we are meeting online only, through our website at 10:30
        a.m. EST on Sunday mornings, every Sunday morning! Please feel free to
        join us using the links on the Service links page or contact &nbsp;
        <a href="mailto:kyle@crossroadsajax.church">
          kyle@crossroadsajax.church
        </a>
        &nbsp; for access! Our Ministry Centre is closed, but our ministry
        continues. In partnership with Johanne’s House, Southside Foodbank, John
        Howard Society, and other tremendous organizations, we seek to serve the
        Ajax community uninterrupted.
      </p>
      {listing}
    </Container>
  )
}
export { ServicePage, Services }
