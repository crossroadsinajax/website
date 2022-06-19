import { getYear, getDayOfYear, fromUnixTime, format } from "date-fns"
import React, { useEffect, useMemo, useRef, useState } from "react"
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

type Poll = {
  version: "0"
  questions: {
    title: string
    answers: string[]
    correct: number[]
  }[]
}

type PollResponse = {
  questionIdx: number
  response: number
  username: string
}

// State for running a poll
// this state is modified by various poll events
type PollState = {
  active: boolean
  currentQuestionIdx: number
  showResults: Boolean
  poll: Poll
  responses: PollResponse[][]
}

// type PollMessageCreate = {
//   type: "create"
//   body: Poll
// }
// 
// type PollMessageResponse = {
//   type: "response"
//   body: PollResponse
// }
// 
// type PollMessageStart = {
//   type: "start"
// }
// 
// type PollMessageStop = {
//   type: "stop"
// }
// 
// type PollMessageNext = {
//   type: "next"
// }

const uniqueResponses = (resps: PollResponse[]): PollResponse[] => {
  // Get the unique responses, keeping the last submitted response
  // while preserving the order of the responses.
  const uniqueResponses: { [username: string]: [number, PollResponse] } = {}
  for (let i = 0; i < resps.length; i++)
    uniqueResponses[resps[i].username] = [i, resps[i]]
  const _finalResponses: [number, PollResponse][] = []
  for (let r in uniqueResponses) _finalResponses.push(uniqueResponses[r])
  const finalResponses: PollResponse[] = _finalResponses
    .sort((a, b) => a[0] - b[0])
    .map((i) => i[1])
  return finalResponses
}

const computeScores = (
  pollState: PollState
): { [username: string]: number }[] => {
  // Compute the scores for all the players
  // Returns the total scores as well as the diff on the latest
  const scores: { [username: string]: number } = {}
  const diff: { [username: string]: number } = {}
  for (let i = 0; i < pollState.responses.length; i++) {
    const unique = uniqueResponses(pollState.responses[i])
    let score = 5
    for (let j = 0; j < unique.length; j++) {
      // Assume only one correct answer for now
      const correctIdx = pollState.poll.questions[i].correct[0]
      const resp = unique[j]
      if (!(resp.username in scores)) scores[resp.username] = 0
      if (resp.response == correctIdx) {
        diff[resp.username] = score
        scores[resp.username] += score
        if (score > 1) score--
      }
    }
  }
  return [scores, diff]
}

const PollQuestion: React.FC<{
  pollState: PollState
  sendMsg: (s: string) => void
  user: UserType
}> = ({ pollState, sendMsg, user }) => {
  const [timeRemaining, setTimeRemaining] = useState(2.0)
  const { responses, poll, currentQuestionIdx } = pollState
  const question = poll.questions[currentQuestionIdx]
  const { title, answers } = question
  const finalResponses = uniqueResponses(responses[currentQuestionIdx])
  const rs = finalResponses.filter((r) => r.username == user.username)
  let response: PollResponse | null = null
  if (rs.length > 0) {
    response = rs[0]
  }
  useEffect(() => {
    const countdown = setInterval(() => {
      if (timeRemaining <= 0) {
        clearInterval(countdown)
        return
      }
      setTimeRemaining(timeRemaining - 1.0)
    }, 1000)
    return () => {
      clearInterval(countdown)
    }
  })

  return (
    <div
      key={title + "question"}
      style={{
        display: "flex",
        backgroundColor: "#F4F8F4",
        flexDirection: "column",
        flexWrap: "nowrap",
        flexGrow: 1,
        justifyContent: "space-evenly",
      }}
    >
      <div
        style={{
          alignSelf: "center",
        }}
      >
        <h3>{title}</h3>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
        }}
      >
        <div
          style={{
            display: "flex",
            flexBasis: "25%",
            flexGrow: 1,
            alignSelf: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              borderRadius: "50%",
              width: "75px",
              backgroundColor: "#D2E3D3",
              lineHeight: "75px",
              textAlign: "center",
              fontSize: "1.75rem",
            }}
          >
            {timeRemaining}
          </div>
        </div>
        <img
          style={{ maxHeight: 150, flexBasis: "50%", flexGrow: 1 }}
          src="https://cdn.britannica.com/93/94493-050-35524FED/Toronto.jpg"
        ></img>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexBasis: "25%",
            flexGrow: 1,
            alignSelf: "center",
            justifyContent: "center",
          }}
        >
          <h3 style={{ alignSelf: "center" }}>{finalResponses.length}</h3>
          <h3 style={{ alignSelf: "center" }}>
            answer{finalResponses.length != 1 ? "s" : ""}
          </h3>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-evenly",
        }}
      >
        {answers.map((a, i) => (
          <div key={a + i}>
            <Button
              style={{
                minWidth: "50px",
              }}
              key={title + a}
              variant={
                response != null && response.response == i
                  ? "primary"
                  : "secondary"
              }
              disabled={response != null}
              onClick={() => {
                sendMsg(
                  "#poll " +
                    JSON.stringify({
                      type: "response",
                      body: {
                        questionIdx: currentQuestionIdx,
                        response: i,
                        username: user.username,
                      },
                    })
                )
              }}
            >
              {a}
            </Button>
          </div>
        ))}
      </div>
      <div
        style={{
          alignSelf: "center",
          justifyContent: "center",
        }}
      >
        {response == null && "Choose your answer!"}
        {response != null && "Your answer has been submitted."}
      </div>
    </div>
  )
}

const PollQuestionResults: React.FC<{
  pollState: PollState
  user: UserType
}> = ({ pollState, user }) => {
  const { responses, poll, currentQuestionIdx } = pollState
  const question = poll.questions[currentQuestionIdx]
  const { title, correct } = question
  const finalResponses = uniqueResponses(responses[currentQuestionIdx])
  const [scores, diffs] = computeScores(pollState)
  let sortedScores: [number, string][] = []
  for (let u in scores) sortedScores.push([scores[u], u])
  sortedScores.sort((a, b) => b[0] - a[0])
  const rs = finalResponses.filter((r) => r.username == user.username)
  let response: PollResponse | null = null
  if (rs.length > 0) {
    response = rs[0]
  }
  const correctResponse = response != null && response.response == correct[0]
  const scoreGained = diffs[user.username]

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#F4F8F4",
        flexDirection: "row",
        flexWrap: "nowrap",
        flexGrow: 1,
        justifyContent: "space-evenly",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          flexGrow: 1,
        }}
      >
        <div
          style={{
            alignSelf: "center",
          }}
        >
          <h3>{title}</h3>
        </div>
        <div
          style={{
            alignSelf: "center",
            backgroundColor: "#D2E3D3",
            fontSize: "2rem",
            paddingLeft: "10px",
            paddingRight: "10px",
            textAlign: "center",
            borderRadius: "5%",
          }}
        >
          {question.answers[correct[0]]}
        </div>
        <div
          style={{
            fontSize: "1rem",
            textAlign: "center",
          }}
        >
          {response == null && "❌ you did not make a guess!"}
          {response != null &&
            !correctResponse &&
            `❌ you incorrectly guessed "${
              question.answers[response.response]
            }"`}
          {correctResponse && `✅ you got it! +${scoreGained} points`}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "space-evenly",
        }}
      >
        <div
          style={{
            alignSelf: "center",
          }}
        >
          <h3>Top 5 Leaderboard</h3>
          <hr />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
          }}
        >
          {sortedScores.slice(0, 5).map(([score, username]) => (
            <div
              key={score + username}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-evenly",
              }}
            >
              <div
                style={{
                  flexBasis: "50%",
                }}
              >
                {score} points
              </div>
              <div
                style={{
                  flexBasis: "50%",
                }}
              >
                {username}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            textAlign: "center",
          }}
        >
          <hr />
          You have {scores[user.username] || 0} points total
        </div>
      </div>
    </div>
  )
}

const PollLeaderboard: React.FC<{}> = ({}) => {
  return (
    <>
      <h1>Results</h1>
    </>
  )
}

const PollTab: React.FC<{
  pollState: PollState
  sendMsg: (s: string) => void
  user: UserType
}> = ({ pollState, sendMsg, user }) => {
  const curIdx = pollState.currentQuestionIdx

  if (!pollState.active || curIdx < 0) {
    return (
      <>
        <_ViewersContainer
          style={{ display: "flex" }}
          className="row form-control flex-grow-1"
        >
          <div>
            <h2 style={{ justifySelf: "center" }}>
              Waiting for poll to start...
            </h2>
            <h3>Rules</h3>
            <ul>
              <li>First to answer correctly scores 5 points</li>
              <li>Second to answer correctly scores 4 points and so on</li>
              <li>Fifth and later to answer correctly score 1 point</li>
              <li>Incorrect answers receive 0 points</li>
              <li>Each question has a time limit of 30 seconds</li>
            </ul>
          </div>
        </_ViewersContainer>
      </>
    )
  }
  if (curIdx == pollState.poll.questions.length) {
    return <PollLeaderboard />
  }
  return (
    <>
      <_ViewersContainer
        style={{ display: "flex" }}
        className="row form-control flex-grow-1"
      >
        {!pollState.showResults && (
          <PollQuestion pollState={pollState} sendMsg={sendMsg} user={user} />
        )}
        {pollState.showResults && (
          <PollQuestionResults pollState={pollState} user={user} />
        )}
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
        currentQuestionIdx: -1,
        showResults: false,
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
      pollState.responses[idx].push(evt.body)
    } else if (type == "next") {
      if (!pollState.showResults && pollState.currentQuestionIdx >= 0) {
        pollState.showResults = true
      } else {
        if (pollState.currentQuestionIdx < pollState.poll.questions.length) {
          pollState.currentQuestionIdx += 1
        }
        pollState.showResults = false
      }
    } else if (type == "prev") {
      pollState.showResults = false
      if (pollState.currentQuestionIdx > -1) {
        pollState.currentQuestionIdx -= 1
      }
    } else if (type == "start") {
      this.props.setLayout("poll")
      this.setTab("poll")
      pollState.active = true
    } else if (type == "stop") {
      this.props.setLayout("stream")
      this.setTab("chat")
      pollState.active = false
    }
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
        <PollTab
          pollState={this.state.pollState}
          sendMsg={this.sendMsg}
          user={user}
        />
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
          show poll
        </Button>
      </>
    )
  } else {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          flexGrow: 1,
          margin: "2px",
        }}
      >
        <Button
          variant="warning"
          onClick={() => {
            sendMsg(
              "#poll " +
                JSON.stringify({
                  type: "prev",
                })
            )
          }}
        >
          go back
        </Button>
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
          {pollState.currentQuestionIdx < 0 && <>start poll</>}
          {pollState.currentQuestionIdx >= 0 &&
            !pollState.showResults &&
            pollState.currentQuestionIdx < pollState.poll.questions.length && (
              <>show results</>
            )}
          {pollState.currentQuestionIdx >= 0 &&
            pollState.showResults &&
            pollState.currentQuestionIdx <
              pollState.poll.questions.length - 1 && <>next question</>}
          {pollState.showResults &&
            pollState.currentQuestionIdx + 1 ==
              pollState.poll.questions.length && <>end poll</>}
        </Button>
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
          hide poll
        </Button>
      </div>
    )
  }
}
