import { gql, useMutation } from "@apollo/client"
import React, { useState } from "react"
import Button from "react-bootstrap/Button"
import Card from "react-bootstrap/Card"
import CardColumns from "react-bootstrap/CardColumns"
import Container from "react-bootstrap/Container"
import Form from "react-bootstrap/Form"
import Nav from "react-bootstrap/Nav"
import Spinner from "react-bootstrap/Spinner"
import Tab from "react-bootstrap/Tab"
import styled from "styled-components"
import { Maybe } from "~/types"
import WebSocketProvider, { WSMessage } from "~Websocket"

import { Error } from "./Error"
import Title from "./Title"
import {
  UserType,
  usePrayerPageQuery,
  PrayerRequestNode,
} from "./generated-types"
import { isDefined } from "./utils"

gql`
  query PrayerPage {
    prayerRequests {
      edges {
        node {
          createdAt
          pk
          providedName
          body
          bodyVisibility
          note
          state
        }
      }
    }
  }
`

const ADD_PRAYER_REQUEST = gql`
  mutation AddPrayerRequest(
    $body: String!
    $bodyVisibility: String!
    $includeName: Boolean!
    $displayName: String!
  ) {
    addPrayerRequest(
      body: $body
      bodyVisibility: $bodyVisibility
      includeName: $includeName
      displayName: $displayName
    ) {
      ok
    }
  }
`

type PrayerRequest = Pick<
  PrayerRequestNode,
  | "createdAt"
  | "pk"
  | "providedName"
  | "body"
  | "bodyVisibility"
  | "note"
  | "state"
>

const _PrayerForm = styled(Form)`
  border: 0.2rem solid #ececec;
  padding: 1rem;
`

const PrayerForm: React.FC<{
  includeContact: boolean
}> = ({ includeContact }) => {
  const [body, setBody] = useState("")
  const [visibility, setVisibility] = useState("All of Crossroads")
  const [includeName, setIncludeName] = useState(true)
  const [displayName, setDisplayName] = useState("")
  const [addPrayerRequest, { loading }] = useMutation(ADD_PRAYER_REQUEST, {
    onCompleted: () => {
      setBody("")
      setVisibility("All of Crossroads")
      setIncludeName(true)
      setDisplayName("")
    },
  })

  const updateBody = (val: string) => {
    setBody(val)
  }

  const onSubmit = () => {
    let bodyVisibility = ""
    if (visibility === "All of Crossroads") {
      bodyVisibility = "member"
    } else if (visibility === "Only the prayer team") {
      bodyVisibility = "prayer_team"
    }

    addPrayerRequest({
      variables: {
        body,
        bodyVisibility,
        includeName,
        displayName,
      },
    })
  }

  return (
    <_PrayerForm className="mt-3">
      <h4>Submit a prayer request or praise report</h4>
      <Form.Group>
        <Form.Label>Prayer request/praise</Form.Label>
        <Form.Control
          as="textarea"
          placeholder="Your prayer request/praise report"
          rows={3}
          value={body}
          onChange={(e) => updateBody(e.currentTarget.value)}
        />
        <Form.Label>Who can see this submission</Form.Label>
        <Form.Control
          as="select"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option>All of Crossroads</option>
          <option>Only the prayer team</option>
          <option>Only me</option>
        </Form.Control>
        {!includeContact && (
          <Form.Check
            className="mt-2"
            type="checkbox"
            label="Include my name"
            checked={includeName}
            onChange={(e) => setIncludeName(e.target.checked)}
          />
        )}
        <Form.Text className="text-muted">
          These settings can be edited later.
        </Form.Text>
        {includeContact && (
          <>
            <Form.Label className="mt-2">Email</Form.Label>
            <Form.Control type="email" placeholder="Enter email" />
            <Form.Label>Name (optional)</Form.Label>
            <Form.Control
              type="input"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </>
        )}
      </Form.Group>
      <Button
        disabled={loading}
        variant="primary"
        onClick={loading ? undefined : onSubmit}
      >
        {loading ? "Loading..." : "Submit"}
      </Button>
    </_PrayerForm>
  )
}

const PrayerCard: React.FC<{
  prayerRequest: PrayerRequest
}> = ({ prayerRequest }) => {
  return (
    <Card>
      <Card.Body>
        <Card.Text>{prayerRequest.body}</Card.Text>
        <footer>
          <span>🙏</span>
          <span>🙌</span>
          <small className="text-muted float-right">
            {prayerRequest.providedName && "--"} {prayerRequest.providedName}
          </small>
        </footer>
      </Card.Body>
    </Card>
  )
}

interface PrayerProps {
  user: Maybe<UserType>
  ws: WebSocketProvider
  requests: PrayerRequest[]
  refetch: () => void
}

type PrayerState = {
  tab: "church" | "mine" | "jar"
}

class Prayer extends React.Component<PrayerProps, PrayerState> {
  state: PrayerState = {
    tab: "church",
  }

  constructor(props: PrayerProps) {
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
    const { ws } = this.props
    ws.send({
      type: "prayer.connect",
    })
  }

  onMessage = (msg: WSMessage) => {
    if (msg.type == "prayer.update") {
      this.props.refetch()
    }
  }

  setTab = (tab: "church" | "mine" | "jar") => {
    this.setState({
      tab: tab,
    })
  }

  getTab = () => {
    const { tab } = this.state
    let component = null
    if (tab == "church") {
      component = (
        <>
          <h2>This week</h2>
          <CardColumns className="mt-2">
            {this.props.requests.map((pr, i) => (
              <PrayerCard key={i} prayerRequest={pr} />
            ))}
          </CardColumns>
          <hr />
        </>
      )
    } else if (tab == "mine") {
      component = null
    } else if (tab == "jar") {
      component = null
    }
    return component
  }

  render() {
    const { user } = this.props
    return (
      <Container>
        <h1 className="mt-3">Prayer</h1>
        <Tab.Container defaultActiveKey="chat">
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link eventKey="chat" onClick={() => this.setTab("church")}>
                Crossroads
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="prayer" onClick={() => this.setTab("mine")}>
                Mine
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="viewers" onClick={() => this.setTab("jar")}>
                Prayer Jar 🍯
              </Nav.Link>
            </Nav.Item>
          </Nav>
          {this.getTab()}
        </Tab.Container>
        <PrayerForm includeContact={!user} />
      </Container>
    )
  }
}

const PrayerPage: React.FC<{
  user: Maybe<UserType>
  ws: WebSocketProvider
}> = ({ user, ws }) => {
  const { data, loading, refetch } = usePrayerPageQuery({
    variables: {},
  })

  let requests: PrayerRequest[] = []
  if (data?.prayerRequests?.edges) {
    // TODO: try to make this into a helper
    const edges = data.prayerRequests.edges
      .filter(isDefined)
      .filter((e) => isDefined(e.node))
    const nodes = edges.map((e) => e.node)
    requests = nodes.filter(isDefined)
  }

  if (requests) {
    return (
      <>
        <Title text="Prayer" />
        <Prayer
          user={user}
          ws={ws}
          requests={requests}
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

export default PrayerPage
