import { getYear, getDayOfYear, fromUnixTime, format } from "date-fns"
import React, { useMemo, useRef, useState } from "react"
import Button from "react-bootstrap/Button"
import Dropdown from "react-bootstrap/Dropdown"
import Nav from "react-bootstrap/Nav"
import Overlay from "react-bootstrap/Overlay"
import Tab from "react-bootstrap/Tab"
import Tooltip from "react-bootstrap/Tooltip"
import styled from "styled-components"
import { UserType } from "~/generated-types"
import WebSocketProvider, { WSMessage } from "~Websocket"

import { ServiceLayout } from "../Service"

const _ChatReactDiv = styled.div<{
  filledIn: boolean
}>`
  padding: 2px;
  display: inherit;
  margin-right: 2px;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 6px;
  background-color: ${({ filledIn }) => (filledIn ? "#d5fadd" : "")};
  color: ${({ filledIn }) => (filledIn ? "black" : "")};
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
  const now = new Date()
  const ts = fromUnixTime(created)
  if (getDayOfYear(now) == getDayOfYear(ts) && getYear(now) == getYear(ts)) {
    return format(ts, "hh:mma")
  }
  return format(ts, "yyyy/MM/dd hh:mmaaa")
}

// TODO: move to server side
const colours = [
  "#000000",
  "#0000ff",
  "#a52a2a",
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
    (tags.includes("gw") && "#d2f8d2") ||
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

  const updateInput = (input: string) => {
    input = input.replace(/\n$/, "")
    setInput(input)
  }

  const submit = (input: string) => {
    onSubmit(input)
    setInput("")
  }

  return (
    <>
      <textarea
        className="form-control"
        rows={1}
        autoComplete="off"
        placeholder="type your message here"
        onChange={(e) => updateInput(e.currentTarget.value)}
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
  chatEndRef: (ref: HTMLDivElement | null) => void
  onScroll: () => void
}> = ({
  user,
  messages,
  onDelete,
  onReact,
  onToggleTag,
  chatEndRef,
  onScroll,
}) => {
  return (
    <_ChatMessageContainer
      className="row form-control flex-grow-1"
      onScroll={onScroll}
    >
      {messages.map((msg) => (
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
  overflow-y: scroll;
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

// type PollQuestion = {
//   title: string
//   answers: string[]
//   correct: number[]
// }

type Poll = {
  version: "0"
  questions: {
    title: string
    answers: string[]
    correct: number[]
  }[]
}

// State for running a poll
// this state is modified by various poll events
type PollState = {
  active: boolean
  currentQuestionIdx: number
  poll: Poll
  responses: {
    user: string
    response: number
  }[][]
}

type PollMessageCreate = {
  type: "create"
  body: Poll
}

type PollMessageResponse = {
  type: "response"
  body: {
    questionIdx: number
    response: string
  }
}

type PollMessageStart = {
  type: "start"
}

type PollMessageStop = {
  type: "stop"
}

type PollMessageNext = {
  type: "next"
}

const PollQuestion: React.FC<{
  title: string
  questionIdx: number
  answers: string[]
  sendMsg: (s: string) => void
  responses: string[]
}> = ({ title, answers, sendMsg, questionIdx, responses }) => {
  return (
    <>
      <h2>{title}</h2>
      {answers.map((a, i) => (
        <>
          <Button
            key={title + a}
            onClick={() => {
              sendMsg(
                "#poll " +
                  JSON.stringify({
                    type: "response",
                    body: {
                      questionIdx: questionIdx,
                      response: i,
                    },
                  })
              )
            }}
          >
            {a}
          </Button>
          <br />
        </>
      ))}
      {responses.length} answer{responses.length > 1 && "s"} submitted
    </>
  )
}

const PollResults: React.FC<{}> = ({}) => {
  return (
    <>
      <h2>Results</h2>
      <ul>
        <li>1. Abi</li>
        <li>2. Steve</li>
        <li>3. Carl</li>
        <li>4. Dave</li>
        <li>5. Evan</li>
        <hr />
        <li>9. Kyle</li>
      </ul>
    </>
  )
}

const PollLeaderboard: React.FC<{}> = ({}) => {
  return <></>
}

const PollWinner: React.FC<{}> = ({}) => {
  return <></>
}

const PollTab: React.FC<{
  pollState: PollState
  sendMsg: (s: string) => void
}> = ({ pollState, sendMsg }) => {
  if (!pollState.active) {
    return (
      <>
        <_ViewersContainer className="row form-control flex-grow-1">
          <h2>Waiting for poll to start</h2>
        </_ViewersContainer>
      </>
    )
  }
  const curIdx = pollState.currentQuestionIdx
  const curQuestion = pollState.poll.questions[curIdx]
  const responses = pollState.responses[curIdx]
  return (
    <>
      <_ViewersContainer className="row form-control flex-grow-1">
        <PollQuestion
          title={curQuestion.title}
          questionIdx={curIdx}
          answers={curQuestion.answers}
          responses={responses}
          sendMsg={sendMsg}
        />
      </_ViewersContainer>
    </>
  )
}

type ChatProps = {
  ws: WebSocketProvider
  user: UserType
  id: number
  layout: ServiceLayout
  setLayout: (layout: ServiceLayout) => void
}

type ChatState = {
  messages: ChatMessage[]
  viewers: Viewer[]
  pollState: PollState | null
  tab: "chat" | "prayer" | "godwink" | "viewers" | "poll"
  chatScrollPaused: boolean
  numMissedMessages: number
}

export default class Chat extends React.Component<ChatProps, ChatState> {
  state: ChatState = {
    messages: [],
    viewers: [],
    pollState: null,
    tab: "chat",
    chatScrollPaused: false,
    numMissedMessages: 0,
  }

  private chatEnd: HTMLDivElement | null

  constructor(props: ChatProps) {
    super(props)
  }

  componentDidMount() {
    const { ws } = this.props
    ws.registerOnOpen(this.onConnect)
    ws.registerOnMessage(this.onMessage)
    console.debug("chat component mounted!")
  }

  onConnect = () => {
    const { id, ws } = this.props
    console.debug("chat connected!")
    ws.send({
      type: "chat.connect",
      chat_id: id,
    })
  }

  componentWillUnmount() {
    const { ws } = this.props
    ws.deregisterOnOpen(this.onConnect)
    ws.deregisterOnMessage(this.onMessage)
    ws.send({
      type: "chat.disconnect",
    })
  }

  scrollToBottom = () => {
    const { chatScrollPaused, tab } = this.state
    if (tab == "viewers") {
      return
    }
    if (!chatScrollPaused && this.chatEnd?.parentElement) {
      this.chatEnd.parentElement.scrollTop = this.chatEnd.offsetTop
      this.setState({
        chatScrollPaused: false,
        numMissedMessages: 0,
      })
    }
  }

  onPollEvent = (pollState: PollState | null, msg: ChatMessage): PollState => {
    if (pollState == null) {
      pollState = {
        active: false,
        currentQuestionIdx: 0,
        poll: {
          version: "0",
          questions: [],
        },
        responses: [],
      }
    }
    const evt = JSON.parse(msg.body.substring(5))
    const type = evt.type
    if (type == "create") {
      pollState.poll = evt.body
      for (let i = 0; i < pollState.poll.questions.length; i++) {
        pollState.responses.push([])
      }
    } else if (type == "response") {
      const idx = evt.body.questionIdx
      pollState.responses[idx].push({
        user: msg.author,
        response: evt.body.response,
      })
    } else if (type == "next") {
    } else if (type == "start") {
      this.props.setLayout("poll")
      this.setTab("poll")
      pollState.active = true
    } else if (type == "stop") {
      this.props.setLayout("stream")
      this.setTab("chat")
      pollState.active = false
    }
    // TODO: this might have to be a copy
    console.log(pollState)
    return pollState
  }

  onMessage = (msg: WSMessage) => {
    let { pollState } = this.state

    if (msg.type == "chat.init") {
      for (let mk in msg.chat.messages) {
        let m = msg.chat.messages[mk]
        if (m.tags.includes("poll")) {
          pollState = this.onPollEvent(pollState, m)
        }
      }
      this.setState(
        {
          messages: msg.chat.messages,
          pollState,
        },
        this.scrollToBottom
      )
    } else if (msg.type == "chat.message") {
      const { chatScrollPaused, numMissedMessages } = this.state
      pollState = this.onPollEvent(pollState, msg.msg)
      this.setState(
        {
          messages: this.state.messages.concat(msg.msg),
          numMissedMessages: chatScrollPaused
            ? numMissedMessages + 1
            : numMissedMessages,
          pollState,
        },
        chatScrollPaused ? () => {} : this.scrollToBottom
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
    const { tab } = this.state
    if (tab == "prayer") {
      msg += " #p"
    } else if (tab == "godwink") {
      msg += " #gw"
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

  setTab = (tab: "chat" | "prayer" | "viewers" | "godwink" | "poll") => {
    let callback = () => {}
    if (tab == "chat" || tab == "prayer" || tab == "godwink") {
      callback = this.scrollToBottom
    }
    this.setState(
      {
        tab: tab,
      },
      callback
    )
  }

  onChatScroll = () => {
    const chatEnd = this.chatEnd
    if (chatEnd?.parentElement) {
      const parentEl = chatEnd.parentElement
      const diff =
        parentEl.scrollHeight - parentEl.clientHeight - parentEl.scrollTop
      if (diff > 60) {
        this.setState({
          chatScrollPaused: true,
        })
      } else if (this.state.chatScrollPaused) {
        this.setState({
          chatScrollPaused: false,
          numMissedMessages: 0,
        })
      }
    }
  }

  getTab = () => {
    const { user } = this.props
    const { tab, messages } = this.state
    // const msgs = messages.filter((m) => !m.tags.includes("poll"))
    const msgs = messages //.filter((m) => !m.tags.includes("poll"))
    let component = null
    if (tab == "chat") {
      component = (
        <ChatTab
          user={user}
          messages={msgs}
          filterTag={""}
          onDelete={this.onDelete}
          onReact={this.onReact}
          onToggleTag={this.onToggleTag}
          chatEndRef={(ref) => {
            this.chatEnd = ref
          }}
          onScroll={this.onChatScroll}
        />
      )
    } else if (tab == "prayer") {
      component = (
        <ChatTab
          user={user}
          messages={msgs.filter((m) => m.tags.includes("pr"))}
          onDelete={this.onDelete}
          onReact={this.onReact}
          onToggleTag={this.onToggleTag}
          chatEndRef={(ref) => {
            this.chatEnd = ref
          }}
          onScroll={this.onChatScroll}
        />
      )
    } else if (tab == "godwink") {
      component = (
        <ChatTab
          user={user}
          messages={msgs.filter((m) => m.tags.includes("gw"))}
          onDelete={this.onDelete}
          onReact={this.onReact}
          onToggleTag={this.onToggleTag}
          chatEndRef={(ref) => {
            this.chatEnd = ref
          }}
          onScroll={this.onChatScroll}
        />
      )
    } else if (tab == "viewers") {
      component = <ViewersTab viewers={this.state.viewers} />
    } else if (tab == "poll" && this.state.pollState != null) {
      component = (
        <PollTab pollState={this.state.pollState} sendMsg={this.sendMsg} />
      )
    }
    return component
  }

  onResumeScroll = () => {
    this.setState(
      {
        chatScrollPaused: false,
      },
      this.scrollToBottom
    )
  }

  render() {
    const { user, layout } = this.props
    // TODO: there is tab logic mixed in this component which is ok given that
    // it's a one-off use at the moment and the component isn't too complex.
    // It might be worth pulling this into a separate Tabs component in the future.
    const {
      chatScrollPaused,
      numMissedMessages,
      viewers,
      tab,
      pollState,
    } = this.state
    const numViewers = viewers.reduce((x: number, v: Viewer) => x + v.count, 0)
    return (
      <div className="d-flex flex-column flex-grow-1 h-100">
        <Tab.Container defaultActiveKey="chat">
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link eventKey="chat" onClick={() => this.setTab("chat")}>
                Chat {numMissedMessages > 0 ? `(${numMissedMessages})` : null}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="prayer" onClick={() => this.setTab("prayer")}>
                Prayer
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="godwink"
                onClick={() => this.setTab("godwink")}
              >
                Godwinks
              </Nav.Link>
            </Nav.Item>
            {layout == "poll" && (
              <Nav.Item>
                <Nav.Link eventKey="poll" onClick={() => this.setTab("poll")}>
                  Poll
                </Nav.Link>
              </Nav.Item>
            )}
            <Nav.Item>
              <Nav.Link
                eventKey="viewers"
                onClick={() => this.setTab("viewers")}
              >
                Viewers ({numViewers})
              </Nav.Link>
            </Nav.Item>
          </Nav>
          {this.getTab()}
          {tab != "poll" && chatScrollPaused && (
            <div
              style={{
                zIndex: 999,
                background: "white",
              }}
            >
              <p style={{ marginBottom: 0, paddingLeft: 4 }}>
                ⏸️ chat is paused.{" "}
                {numMissedMessages > 0 && (
                  <>
                    {numMissedMessages} unread message
                    {numMissedMessages > 1 ? "s" : ""} below.{" "}
                  </>
                )}
                Click{" "}
                <a
                  style={{ color: "#007bff", cursor: "pointer" }}
                  onClick={this.onResumeScroll}
                >
                  here
                </a>{" "}
                to scroll down.
              </p>
            </div>
          )}
        </Tab.Container>
        <div
          className="row"
          style={{
            marginLeft: "unset",
            marginRight: "unset",
          }}
        >
          {tab != "poll" && <ChatInput onSubmit={this.sendMsg} />}
          {user.isChatmod && (
            <PollModControls pollState={pollState} sendMsg={this.sendMsg} />
          )}
        </div>
      </div>
    )
  }
}

const PollModControls: React.FC<{
  pollState: PollState | null
  sendMsg: (msg: string) => void
}> = ({ pollState, sendMsg }) => {
  if (pollState == null) {
    return <></>
  }
  if (!pollState.active) {
    return (
      <>
        <Button
          onClick={() => {
            sendMsg(
              "#poll " +
                JSON.stringify({
                  type: "start",
                })
            )
          }}
        >
          start poll
        </Button>
      </>
    )
  } else {
    return (
      <>
        <Button
          onClick={() => {
            sendMsg(
              "#poll " +
                JSON.stringify({
                  type: "next",
                })
            )
          }}
        >
          next poll question
        </Button>
        <Button>show poll results</Button>
        <Button
          onClick={() => {
            sendMsg(
              "#poll " +
                JSON.stringify({
                  type: "stop",
                })
            )
          }}
        >
          stop poll
        </Button>
      </>
    )
  }
}
