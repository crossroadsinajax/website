import moment from "moment"
import React, { useMemo, useRef, useState } from "react"
import Dropdown from "react-bootstrap/Dropdown"
import Nav from "react-bootstrap/Nav"
import Overlay from "react-bootstrap/Overlay"
import Tab from "react-bootstrap/Tab"
import Tooltip from "react-bootstrap/Tooltip"
import styled from "styled-components"
import { UserType } from "~/generated-types"
import WebSocketProvider, { WSMessage } from "~Websocket"

const _ChatReactDiv = styled.div<{
  filledIn: boolean
}>`
  padding: 2px;
  display: inherit;
  margin-right: 2px;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 6px;
  background-color: ${({ filledIn }) => (filledIn ? "#007bff" : "")};
  color: ${({ filledIn }) => (filledIn ? "white" : "")};
`

type ChatMessage = {
  author: string
  body: string
  created_at: number
  id: number
  reacts: {
    [x: string]: {
      count: number
      reactors: string[]
    }
  }
  tags: string[]
}

type Viewer = {
  username: string
  count: number
}

const ChatReactSelector: React.FC<{
  user: UserType
  react: string
  msg: ChatMessage
  onReact: (msg: ChatMessage, react: string) => void
}> = ({ user, msg, react, onReact }) => {
  const [showReactors, setShowReactors] = useState(false)
  const target = useRef(null)

  return (
    <>
      <a
        ref={target}
        onMouseEnter={() => setShowReactors(true)}
        onMouseLeave={() => setShowReactors(false)}
        style={{ cursor: "pointer" }}
        onClick={() => onReact(msg, react)}
      >
        <_ChatReactDiv
          slot="reference"
          filledIn={
            react in msg.reacts &&
            msg.reacts[react].reactors.includes(user.username)
          }
        >
          <span className="ml-1">{react}</span>
          <span className="mr-1" style={{ marginLeft: "2px" }}>
            {msg.reacts[react].count}
          </span>
        </_ChatReactDiv>
      </a>
      <Overlay target={target.current} show={showReactors} placement="right">
        {(props) => (
          <Tooltip id={msg.id + react + "-tooltip"} {...props}>
            {msg.reacts[react].reactors.map((reactor, i) => (
              <div key={i}>{reactor}</div>
            ))}
          </Tooltip>
        )}
      </Overlay>
    </>
  )
}

const datefmt = (created: number) => {
  const now = moment()
  const ts = moment.unix(created)
  if (now.day() != ts.day()) {
    return ts.format("DD/MM/YY hh:mma")
  }
  return ts.format("hh:mma")
}

// TODO: move to server side
const colours = [
  "#000000",
  "#0000ff",
  "#a52a2a",
  "#00ffff",
  "#00008b",
  "#008b8b",
  "#006400",
  "#bdb76b",
  "#8b008b",
  "#556b2f",
  "#ff8c00",
  "#9932cc",
  "#8b0000",
  "#9400d3",
  "#008000",
  "#4b0082",
  "#808000",
  "#ffa500",
  "#ffc0cb",
  "#800080",
  "#800080",
  "#ff0000",
  "#ffff00",
]

const hashCode = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    let character = str.charCodeAt(i)
    hash = (hash << 5) - hash + character
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

const authorColour = (name: string) => {
  return colours[Math.abs(hashCode(name)) % (colours.length - 1)]
}

const _WarningDropdownMenuItem = styled(Dropdown.Item)`
  color: red;
`

const ChatMessageModControls: React.FC<{
  msg: ChatMessage
  onDelete: (msg: ChatMessage) => void
  onToggleTag: (msg: ChatMessage, tag: string) => void
}> = ({ msg, onDelete, onToggleTag }) => {
  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="warning"
        className="float-right"
        id={msg.id + "-dropdown"}
        style={{ marginTop: "4px" }}
      />
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => onToggleTag(msg, "pr")}>
          {msg.tags.includes("pr") ? "Untag" : "Tag"}
          {" as #pr"}
        </Dropdown.Item>
        <_WarningDropdownMenuItem onClick={() => onDelete(msg)}>
          Delete message
        </_WarningDropdownMenuItem>
        <_WarningDropdownMenuItem onClick={() => onDelete(msg)}>
          Delete all messages from user
        </_WarningDropdownMenuItem>
      </Dropdown.Menu>
    </Dropdown>
  )
}

const _ChatMessageCard = styled.div<{
  tags: string[]
}>`
  background-color: ${({ tags }) =>
    (tags.includes("pr") && "#f6efe2") ||
    (tags.includes("q") && "#d2f8d2") ||
    ""};
  font-size: 14px;
  border-width: 0px 0px 1px 1px;
  border-radius: unset;
`

const _ChatMessageTopRightControls = styled.div<{
  hover: boolean
}>`
  height: 1px;
  visibility: ${(props) => (props.hover ? "" : "hidden")};
`

const _ChatMessageEmojiSelector = styled.span`
  cursor: pointer;
  filter: grayscale(100%);
  padding-top: 3px;
  padding-right: 5px;
  font-size: 1rem;
`

const _ChatMessageContent = styled.div`
  padding: 0.15rem 1.5rem 0rem 0.25rem;
`

const _ChatMessageDateSpan = styled.span`
  color: grey;
  margin-left: 3px;
`

const _ChatMessageBody = styled.div`
  font-size: 16px;
  margin-bottom: 3px;
`

const _ChatFooter = styled.footer`
  font-size: 14px;
  margin-bottom: 5px;
`

type ChatMessageProps = {
  user: UserType
  msg: ChatMessage
  onReact: (msg: ChatMessage, react: string) => void
  onDelete: (msg: ChatMessage) => void
  onToggleTag: (msg: ChatMessage, tag: string) => void
}

const MemodChatMessageRC: React.FC<ChatMessageProps> = (
  props: ChatMessageProps
) => {
  const mem = useMemo(() => <ChatMessageRC {...props} />, [
    props.user,
    props.msg,
  ])
  return mem
}

const ChatMessageRC: React.FC<ChatMessageProps> = ({
  user,
  msg,
  onReact,
  onDelete,
  onToggleTag,
}) => {
  const [hover, toggleHover] = useState(false)
  const possibleReacts = ["🙏", "🙌", "🤣", "👍"]
  const msgReacts = possibleReacts.filter((r) => r in msg.reacts)

  return (
    <_ChatMessageCard
      className="card"
      tags={msg.tags}
      onMouseEnter={() => toggleHover(true)}
      onMouseLeave={() => toggleHover(false)}
    >
      <_ChatMessageTopRightControls className="float-right" hover={hover}>
        {user.isChatmod && (
          <ChatMessageModControls
            msg={msg}
            onDelete={onDelete}
            onToggleTag={onToggleTag}
          />
        )}
        {possibleReacts.reverse().map((react, i) => (
          <_ChatMessageEmojiSelector
            key={react + i}
            className="float-right"
            onClick={() => onReact(msg, react)}
          >
            {react}
          </_ChatMessageEmojiSelector>
        ))}
      </_ChatMessageTopRightControls>

      <_ChatMessageContent className="card-body">
        <span style={{ color: authorColour(msg.author) }}>{msg.author}</span>
        <_ChatMessageDateSpan>{datefmt(msg.created_at)}</_ChatMessageDateSpan>
        <br />
        <_ChatMessageBody>
          <span>{msg.body}</span>
        </_ChatMessageBody>
        <_ChatFooter>
          {msgReacts.map((react, i) => (
            <ChatReactSelector
              user={user}
              key={react + i}
              msg={msg}
              react={react}
              onReact={onReact}
            />
          ))}
        </_ChatFooter>
      </_ChatMessageContent>
    </_ChatMessageCard>
  )
}

type ChatInputProps = {
  onSubmit: (msg: string) => void
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit }) => {
  const [input, setInput] = useState("")

  const submit = (input: string) => {
    onSubmit(input)
    setInput("")
  }

  return (
    <>
      <input
        className="form-control"
        type="text"
        autoComplete="off"
        placeholder="type your message here"
        onChange={(e) => setInput(e.currentTarget.value)}
        value={input}
        onKeyPress={(e) => {
          if (e.charCode == 13) {
            submit(input)
          }
        }}
      />
      <button
        className="btn btn-primary form-control"
        onClick={() => {
          submit(input)
        }}
      >
        send
      </button>
    </>
  )
}

const _ChatMessageContainer = styled.div`
  overflow-y: scroll;
  word-break: break-word;
  font-size: 14px;
  padding: 0px;
  margin-left: unset;
  margin-right: unset;
`

const ChatTab: React.FC<{
  user: UserType
  messages: ChatMessage[]
  onDelete: (msg: ChatMessage) => void
  onReact: (msg: ChatMessage, react: string) => void
  onToggleTag: (msg: ChatMessage, tag: string) => void
  filterTag: string
  chatEndRef: (ref: HTMLDivElement | null) => void
}> = ({
  user,
  messages,
  onDelete,
  onReact,
  onToggleTag,
  filterTag,
  chatEndRef,
}) => {
  let msgs
  if (filterTag) {
    msgs = messages.filter((msg) => msg.tags.includes(filterTag))
  } else {
    msgs = messages
  }

  return (
    <_ChatMessageContainer className="row form-control flex-grow-1">
      {msgs.map((msg) => (
        <MemodChatMessageRC
          user={user}
          key={msg.id}
          msg={msg}
          onReact={onReact}
          onDelete={onDelete}
          onToggleTag={onToggleTag}
        />
      ))}
      <div ref={chatEndRef} />
    </_ChatMessageContainer>
  )
}

const _ViewersContainer = styled.div`
  padding: 0px;
  margin-left: unset;
  margin-right: unset;
`

const ViewersTab: React.FC<{
  viewers: Viewer[]
}> = ({ viewers }) => {
  return (
    <_ViewersContainer className="row form-control flex-grow-1">
      {viewers.map((v, i) => (
        <div key={i}>
          {v.username} {v.count > 1 && <span>({v.count})</span>}
        </div>
      ))}
    </_ViewersContainer>
  )
}

type ChatProps = {
  ws: WebSocketProvider
  user: UserType
  id: number
}

type ChatState = {
  messages: ChatMessage[]
  viewers: Viewer[]
  tab: "chat" | "prayer" | "viewers"
}

export default class Chat extends React.Component<ChatProps, ChatState> {
  state: ChatState = {
    messages: [],
    viewers: [],
    tab: "chat",
  }

  private chatEnd: HTMLDivElement | null

  constructor(props: ChatProps) {
    super(props)
  }

  componentDidMount() {
    this.props.ws.registerOnOpen(this.onConnect)
    this.props.ws.registerOnMessage(this.onMessage)
    console.debug("chat component mounted!")
  }

  onConnect = () => {
    console.debug("chat connected!")
    this.props.ws.send({
      type: "chat.connect",
      chat_id: this.props.id,
    })
  }

  componentWillUnmount() {
    this.props.ws.deregisterOnOpen(this.onConnect)
    this.props.ws.deregisterOnMessage(this.onMessage)
  }

  scrollToBottom = () => {
    if (this.chatEnd && this.chatEnd.parentElement) {
      this.chatEnd.parentElement.scrollTop = this.chatEnd.offsetTop
    }
  }

  onMessage = (msg: WSMessage) => {
    if (msg.type == "chat.init") {
      this.setState(
        {
          messages: msg.chat.messages,
        },
        this.scrollToBottom
      )
    } else if (msg.type == "chat.message") {
      this.setState(
        {
          messages: this.state.messages.concat(msg.msg),
        },
        this.scrollToBottom
      )
    } else if (msg.type == "chat.message_update") {
      const messages = this.state.messages.map((m) =>
        m.id === msg.msg.id ? msg.msg : m
      )
      this.setState(
        {
          messages: messages,
        },
        this.scrollToBottom
      )
    } else if (msg.type == "chat.message_delete") {
      const messages = this.state.messages.filter((m) => m.id != msg.msg_id)
      this.setState({
        messages: messages,
      })
    } else if (msg.type == "chat.users_update") {
      const viewers = msg.users
      this.setState({
        viewers: viewers,
      })
    }
  }

  sendMsg = (msg: string) => {
    if (!msg) {
      return
    }
    this.props.ws.send({
      type: "chat.message",
      body: msg,
    })
  }

  onReact = (msg: ChatMessage, react: string) => {
    this.props.ws.send({
      type: "chat.react",
      msg_id: msg.id,
      react: react,
    })
  }

  onDelete = (msg: ChatMessage) => {
    this.props.ws.send({
      type: "chat.message_delete",
      msg_id: msg.id,
    })
  }

  onToggleTag = (msg: ChatMessage, tag: string) => {
    this.props.ws.send({
      type: "chat.toggle_tag",
      msg_id: msg.id,
      tag: tag,
    })
  }

  setTab = (tab: "chat" | "prayer" | "viewers") => {
    this.setState({
      tab: tab,
    })
  }

  getTab = () => {
    const { tab } = this.state
    let component = null
    if (tab == "chat") {
      component = (
        <ChatTab
          user={this.props.user}
          messages={this.state.messages}
          filterTag={""}
          onDelete={this.onDelete}
          onReact={this.onReact}
          onToggleTag={this.onToggleTag}
          chatEndRef={(ref) => {
            this.chatEnd = ref
          }}
        />
      )
    } else if (tab == "prayer") {
      component = (
        <ChatTab
          user={this.props.user}
          messages={this.state.messages}
          filterTag={"pr"}
          onDelete={this.onDelete}
          onReact={this.onReact}
          onToggleTag={this.onToggleTag}
          chatEndRef={(ref) => {
            this.chatEnd = ref
          }}
        />
      )
    } else if (tab == "viewers") {
      component = <ViewersTab viewers={this.state.viewers} />
    }
    return component
  }

  render() {
    // TODO: there is tab logic mixed in this component which is ok given that
    // it's a one-off use at the moment and the component isn't too complex.
    // It might be worth pulling this into a separate Tabs component in the future.
    return (
      <div className="d-flex flex-column flex-grow-1 h-100">
        <Tab.Container defaultActiveKey="chat">
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link eventKey="chat" onClick={() => this.setTab("chat")}>
                Chat
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="prayer" onClick={() => this.setTab("prayer")}>
                Prayer
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="viewers"
                onClick={() => this.setTab("viewers")}
              >
                Viewers
              </Nav.Link>
            </Nav.Item>
          </Nav>
          {this.getTab()}
        </Tab.Container>
        <div
          className="row"
          style={{
            marginLeft: "unset",
            marginRight: "unset",
          }}
        >
          <ChatInput onSubmit={this.sendMsg} />
        </div>
      </div>
    )
  }
}
