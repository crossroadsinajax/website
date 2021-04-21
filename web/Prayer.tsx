import { gql, useMutation } from "@apollo/client"
import React, { useState } from "react"
import Button from "react-bootstrap/Button"
import Card from "react-bootstrap/Card"
import CardColumns from "react-bootstrap/CardColumns"
import Container from "react-bootstrap/Container"
import Dropdown from "react-bootstrap/Dropdown"
import DropdownButton from "react-bootstrap/DropdownButton"
import Form from "react-bootstrap/Form"
import Nav from "react-bootstrap/Nav"
import Spinner from "react-bootstrap/Spinner"
import Tab from "react-bootstrap/Tab"
import styled from "styled-components"
import { Maybe } from "~/types"
import WebSocketProvider, { WSMessage } from "~Websocket"

import { Error } from "./Error"
import Title from "./Title"
import { DropdownItemWarning } from "./components"
import {
  UserType,
  usePrayerPageQuery,
  PrayerPageQuery,
  PrayerRequestBodyVisibility,
  PrayerRequestState,
} from "./generated-types"

gql`
  query PrayerPage {
    prayerRequests {
      edges {
        node {
          author {
            username
          }
          createdAt
          pk
          providedName
          body
          bodyVisibility
          note
          state
          reacts {
            edges {
              node {
                user {
                  username
                }
                type
              }
            }
          }
        }
      }
    }
  }
`
// Gotta be a better way...
type PrayerRequests = PrayerPageQuery["prayerRequests"]
type PrayerRequest = NonNullable<
  NonNullable<NonNullable<PrayerRequests["edges"]>[0]>["node"]
>
type PrayerRequestReact = NonNullable<
  NonNullable<PrayerRequest["reacts"]["edges"]>[0]
>["node"]

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
        <Form.Label>Prayer request/praise report</Form.Label>
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
          {!includeContact && <option>Only me</option>}
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
        {!includeContact && (
          <Form.Text className="text-muted">
            These settings can be edited later.
          </Form.Text>
        )}
        {includeContact && (
          <>
            <Form.Label className="mt-2">Email (optional)</Form.Label>
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

const _PrayerCardMenuButton = styled(DropdownButton)`
  button {
    background-color: transparent;
    color: black;
    margin: 5px;
    border: 1px solid rgba(0, 0, 0, 0.125);
  }
`

const PrayerCard: React.FC<{
  prayerRequest: PrayerRequest
  onDelete: (id: number) => void
  onResolve: (id: number) => void
  onActivate: (id: number) => void
  onReact: (id: number, react: string) => void
}> = ({ prayerRequest, onDelete, onResolve, onActivate, onReact }) => {
  const { body, pk } = prayerRequest
  let reacts: PrayerRequestReact[] = []
  if (prayerRequest.reacts.edges) {
    reacts = prayerRequest.reacts.edges.map((e) => e && e.node)
  }
  const prayReacts = reacts.filter((r) => r?.type === "🙏")
  const praiseReacts = reacts.filter((r) => r?.type === "🙌")
  return (
    <Card>
      <div className="float-right">
        <_PrayerCardMenuButton
          variant="secondary"
          id={prayerRequest.pk + "-dropdown"}
          title=""
        >
          {prayerRequest.state === PrayerRequestState.Act && (
            <Dropdown.Item onClick={() => onResolve(pk)}>Resolve</Dropdown.Item>
          )}
          {prayerRequest.state === PrayerRequestState.Res && (
            <Dropdown.Item onClick={() => onActivate(pk)}>
              Unresolve
            </Dropdown.Item>
          )}
          <Dropdown.Item>Edit</Dropdown.Item>
          <DropdownItemWarning onClick={() => onDelete(pk)}>
            Delete
          </DropdownItemWarning>
        </_PrayerCardMenuButton>
      </div>
      <Card.Body>
        <Card.Text>{body}</Card.Text>
        <footer>
          <a onClick={() => onReact(pk, "🙏")} style={{ cursor: "pointer" }}>
            <span>🙏</span>
            <span className="ml-1">{prayReacts.length}</span>
          </a>
          <a onClick={() => onReact(pk, "🙌")} style={{ cursor: "pointer" }}>
            <span className="ml-2">🙌</span>
            <span className="ml-1">{praiseReacts.length}</span>
          </a>
          <small className="text-muted float-right">
            {prayerRequest.providedName && "--"} {prayerRequest.providedName}
          </small>
        </footer>
      </Card.Body>
    </Card>
  )
}

interface PrayerProps {
  user: UserType
  ws: WebSocketProvider
  requests: PrayerPageQuery["prayerRequests"]
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

  onDelete = (id: number) => {
    const { ws } = this.props
    ws.send({
      type: "prayer.delete",
      id,
    })
  }

  onReact = (id: number, react: string) => {
    const { ws } = this.props
    ws.send({
      type: "prayer.react",
      id,
      react,
    })
  }

  onResolve = (id: number) => {
    const { ws } = this.props
    ws.send({
      type: "prayer.resolve",
      id,
    })
  }

  onActivate = (id: number) => {
    const { ws } = this.props
    ws.send({
      type: "prayer.activate",
      id,
    })
  }

  getTab = () => {
    const { requests, user } = this.props
    const { tab } = this.state
    let component = null
    if (!requests.edges) return null

    if (tab == "church") {
      const churchRequests = requests.edges.filter(
        (e) =>
          e &&
          e.node &&
          e.node.bodyVisibility === PrayerRequestBodyVisibility.Member &&
          e.node.state === PrayerRequestState.Act
      )
      component = (
        <>
          <h2>This week</h2>
          <CardColumns className="mt-2">
            {churchRequests.map(
              (e, i) =>
                e &&
                e.node && (
                  <PrayerCard
                    key={i}
                    prayerRequest={e.node}
                    onActivate={this.onActivate}
                    onDelete={this.onDelete}
                    onReact={this.onReact}
                    onResolve={this.onResolve}
                  />
                )
            )}
          </CardColumns>
        </>
      )
    } else if (tab == "mine") {
      const myRequests = requests.edges.filter(
        (e) => e && e.node && e.node.author?.username === user.username
      )
      component = (
        <CardColumns className="mt-2">
          {myRequests.map(
            (e, i) =>
              e &&
              e.node && (
                <PrayerCard
                  key={i}
                  onActivate={this.onActivate}
                  prayerRequest={e.node}
                  onDelete={this.onDelete}
                  onReact={this.onReact}
                  onResolve={this.onResolve}
                />
              )
          )}
        </CardColumns>
      )
    } else if (tab == "jar") {
      const churchRequests = requests.edges.filter(
        (e) =>
          e &&
          e.node &&
          e.node.bodyVisibility === PrayerRequestBodyVisibility.Member &&
          e.node.state === PrayerRequestState.Res
      )
      component = (
        <CardColumns className="mt-2">
          {churchRequests.map(
            (e, i) =>
              e &&
              e.node && (
                <PrayerCard
                  key={i}
                  prayerRequest={e.node}
                  onDelete={this.onDelete}
                  onResolve={this.onResolve}
                  onReact={this.onReact}
                  onActivate={this.onActivate}
                />
              )
          )}
        </CardColumns>
      )
    }
    return (
      <>
        {component}
        <hr />
      </>
    )
  }

  render() {
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
          <div className="mt-2">{this.getTab()}</div>
        </Tab.Container>
        <PrayerForm includeContact={false} />
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

  if (data) {
    return (
      <>
        <Title text="Prayer" />
        {user && (
          <Prayer
            user={user}
            ws={ws}
            requests={data.prayerRequests}
            refetch={() => {
              refetch()
            }}
          />
        )}
        {!user && (
          <Container>
            <h2>Prayer</h2>
            <PrayerForm includeContact={true} />
          </Container>
        )}
      </>
    )
  } else if (loading) {
    return <Spinner animation="border"></Spinner>
  } else {
    return <Error />
  }
}

export default PrayerPage
