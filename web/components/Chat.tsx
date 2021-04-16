import moment from "moment"
import React, { useRef, useState } from "react"
import Dropdown from "react-bootstrap/Dropdown"
import Nav from "react-bootstrap/Nav"
import Overlay from "react-bootstrap/Overlay"
import Tab from "react-bootstrap/Tab"
import Tooltip from "react-bootstrap/Tooltip"
import styled from "styled-components"
import { UserType } from "~/generated-types"
import WebSocketProvider, { WSMessage } from "~Websocket"

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

const ChatReactSelector: React.FC<{
  react: string
  msg: ChatMessage
  onReact: (msg: ChatMessage, react: string) => void
}> = ({ msg, react, onReact }) => {
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
        <div
          slot="reference"
          style={{
            display: "inherit",
            border: "1px solid rgba(0,0,0,.125)",
            borderRadius: "6px",
          }}
        >
          <span className="ml-1">{react}</span>
          <span className="mr-1">{msg.reacts[react].count}</span>
        </div>
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
  "#00ffff",
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

type ChatMessageProps = {
  user: UserType
  msg: ChatMessage
  onReact: (msg: ChatMessage, react: string) => void
  onDelete: (msg: ChatMessage) => void
  onToggleTag: (msg: ChatMessage, tag: string) => void
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

      <div
        className="card-body"
        style={{
          padding: "0.15rem 1.5rem 0rem 0.25rem",
        }}
      >
        <span style={{ color: authorColour(msg.author) }}>{msg.author}</span>
        <span style={{ color: "grey", marginLeft: "3px" }}>
          {datefmt(msg.created_at)}
        </span>
        <br />
        <div
          style={{
            fontSize: "1rem",
            marginBottom: "3px",
          }}
        >
          <span>{msg.body}</span>
        </div>
        <footer style={{ fontSize: "14px", marginBottom: "5px" }}>
          {msgReacts.map((react, i) => (
            <ChatReactSelector
              key={react + i}
              msg={msg}
              react={react}
              onReact={onReact}
            />
          ))}
        </footer>
      </div>
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

type ChatProps = {
  ws: WebSocketProvider
  user: UserType
  id: number
}

type ChatState = {
  messages: ChatMessage[]
  filterTag: string
}

export default class Chat extends React.Component<ChatProps, ChatState> {
  state: ChatState = {
    messages: [],
    filterTag: "",
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
    // This scrolls the whole page
    // this.chatEnd?.scrollIntoView({
    //   behavior: "smooth",
    // })
    if (this.chatEnd && this.chatEnd.parentElement) {
      this.chatEnd.parentElement.scrollTop = this.chatEnd.offsetTop
    }
  }

  onMessage = (msg: WSMessage) => {
    if (msg.type == "chat.init") {
      this.setState({
        messages: msg.chat.messages,
      })
      this.scrollToBottom()
    } else if (msg.type == "chat.message") {
      this.setState({
        messages: this.state.messages.concat(msg.msg),
      })
      this.scrollToBottom()
    } else if (msg.type == "chat.message_update") {
      const messages = this.state.messages.map((m) =>
        m.id === msg.msg.id ? msg.msg : m
      )
      this.setState({
        messages: messages,
      })
      this.scrollToBottom()
    } else if (msg.type == "chat.message_delete") {
      const messages = this.state.messages.filter((m) => m.id != msg.msg_id)
      this.setState({
        messages: messages,
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

  onDeleteMessage = (msg: ChatMessage) => {
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

  setFilterTag = (tag: string) => {
    this.setState({
      filterTag: tag,
    })
  }

  render() {
    const { messages, filterTag } = this.state

    let msgs
    if (filterTag) {
      console.log(filterTag)
      msgs = messages.filter((msg) => msg.tags.includes(filterTag))
    } else {
      msgs = messages
    }

    return (
      <div className="d-flex flex-column flex-grow-1 h-100">
        <Tab.Container defaultActiveKey="chat">
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link eventKey="chat" onClick={() => this.setFilterTag("")}>
                Chat
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="prayer"
                onClick={() => this.setFilterTag("pr")}
              >
                Prayer
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <_ChatMessageContainer className="row form-control flex-grow-1">
            {msgs.map((msg) => (
              <ChatMessageRC
                user={this.props.user}
                key={msg.id}
                msg={msg}
                onReact={this.onReact}
                onDelete={this.onDeleteMessage}
                onToggleTag={this.onToggleTag}
              />
            ))}
            <div
              ref={(el) => {
                this.chatEnd = el
              }}
            />
          </_ChatMessageContainer>
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
