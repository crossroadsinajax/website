import React from "react";
import WebSocketProvider, { WSMessage } from "~Websocket";

type ChatMessage = {
  author: string;
  body: string;
  created_at: number;
  id: number;
  reacts: {
    [x: string]: {
      count: number;
      reactors: string[];
    };
  };
  tags: string[];
};

const ChatReactSelector: React.FC<{
  react: string;
  msg: ChatMessage;
  onReact: (msg: ChatMessage, react: string) => void;
}> = ({ msg, react, onReact }) => {
  return (
    <div
      style={{
        cursor: "pointer",
        filter: "grayscale(100%)",
        fontSize: "1rem",
      }}
      onClick={() => onReact(msg, react)}
    >
      {react}
    </div>
  );
};

type ChatMessageProps = {
  msg: ChatMessage;
  onReact: (msg: ChatMessage, react: string) => void;
  onDelete: (msg: ChatMessage) => void;
};

const ChatMessageRC: React.FC<ChatMessageProps> = ({
  msg,
  onReact,
  onDelete,
}) => {
  const possibleReacts = ["🙏", "🙌", "🤣", "👍"];
  const msgReacts = possibleReacts.filter((r) => r in msg.reacts);
  return (
    <div
      style={{
        borderStyle: "solid",
        borderWidth: "0px 0px 1px 0px",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: "14px",
        }}
      >
        {msg.author} | {msg.created_at} |{" "}
        {possibleReacts.map((r, i) => (
          <ChatReactSelector
            key={r + i}
            react={r}
            msg={msg}
            onReact={onReact}
          />
        ))}
        <div onClick={() => onDelete(msg)} style={{ cursor: "pointer" }}>
          X
        </div>
      </div>
      <div
        style={{
          fontSize: "16px",
        }}
      >
        {msg.body}
      </div>
      <div
        style={{
          display: "flex",
        }}
      >
        {msgReacts.map((r, i) => (
          <div
            key={r + i}
            onClick={() => onReact(msg, r)}
            style={{ cursor: "pointer" }}
          >
            {r}
            {msg.reacts[r].count}
          </div>
        ))}
      </div>
    </div>
  );
};

type ChatProps = {
  ws: WebSocketProvider;
  id: number;
};

type ChatState = {
  messages: ChatMessage[];
  message: string;
};

export default class Chat extends React.Component<ChatProps, ChatState> {
  state: ChatState = {
    messages: [],
    message: "",
  };
  private chatEnd: HTMLDivElement | null;

  constructor(props: ChatProps) {
    super(props);
  }

  componentDidMount() {
    // TODO: what if socket isn't open yet?
    this.props.ws.send({
      type: "chat.connect",
      chat_id: this.props.id,
    });
    this.props.ws.registerOnMessage(this.onMessage);
  }

  componentWillUnmount() {
    this.props.ws.deregisterOnMessage(this.onMessage);
  }

  scrollToBottom = () => {
    this.chatEnd?.scrollIntoView({
      behavior: "smooth",
    });
  };

  onMessage = (msg: WSMessage) => {
    if (msg.type == "chat.init") {
      this.setState({
        messages: msg.chat.messages,
      });
      this.scrollToBottom();
    } else if (msg.type == "chat.message") {
      this.setState({
        messages: this.state.messages.concat(msg.msg),
      });
      this.scrollToBottom();
    } else if (msg.type == "chat.message_update") {
      const messages = this.state.messages.map((m) =>
        m.id === msg.msg.id ? msg.msg : m
      );
      this.setState({
        messages: messages,
      });
      this.scrollToBottom();
    } else if (msg.type == "chat.message_delete") {
      const messages = this.state.messages.filter((m) => m.id != msg.msg_id);
      this.setState({
        messages: messages,
      });
    }
  };

  handleMessage = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      message: e.currentTarget.value,
    });
  };

  sendMsg = () => {
    this.props.ws.send({
      type: "chat.message",
      body: this.state.message,
    });

    this.setState({
      message: "",
    });
  };

  onReact = (msg: ChatMessage, react: string) => {
    this.props.ws.send({
      type: "chat.react",
      msg_id: msg.id,
      react: react,
    });
  };

  onKeyPress = (e: React.KeyboardEvent) => {
    if (e.charCode == 13) {
      this.sendMsg();
    }
  };

  onDeleteMessage = (msg: ChatMessage) => {
    this.props.ws.send({
      type: "chat.message_delete",
      msg_id: msg.id,
    });
  };

  render() {
    return (
      <div>
        <div
          style={{
            height: "400px",
            overflowY: "scroll",
            wordBreak: "break-word",
          }}
        >
          {this.state.messages.map((msg) => (
            <ChatMessageRC
              key={msg.id}
              msg={msg}
              onReact={this.onReact}
              onDelete={this.onDeleteMessage}
            />
          ))}
          <div
            ref={(el) => {
              this.chatEnd = el;
            }}
            style={{
              float: "left",
              clear: "both",
            }}
          ></div>
        </div>
        <input
          type="text"
          autoComplete="off"
          placeholder="type your message here"
          onChange={this.handleMessage}
          value={this.state.message}
          onKeyPress={this.onKeyPress}
        />
        <button onClick={this.sendMsg}>send</button>
      </div>
    );
  }
}
