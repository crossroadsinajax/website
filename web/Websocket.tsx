import React from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

type WebSocketProviderProps = {
  url: string;
  children: React.FC<{ ws: WebSocketProvider }>;
};

type WebSocketProviderState = {
  ws: ReconnectingWebSocket;
};

export type WSMessage = {
  type: string;
  [x: string]: any;
};

type WSMessageHandler = (arg0: WSMessage) => void;
type WSOpenHandler = () => void;

export default class WebSocketProvider extends React.Component<
  WebSocketProviderProps,
  WebSocketProviderState
> {
  state: WebSocketProviderState = {
    ws: new ReconnectingWebSocket(this.props.url),
  };

  onMessageHandlers: WSMessageHandler[];
  onOpenHandlers: WSOpenHandler[];

  constructor(props: WebSocketProviderProps) {
    super(props);
    this.onMessageHandlers = [];
    this.onOpenHandlers = [];
    this.state.ws.addEventListener("open", this.onOpen);
    this.state.ws.addEventListener("message", this.onMessage);
  }

  isReady = () => {
    return this.state.ws.readyState == this.state.ws.OPEN;
  };

  registerOnOpen = (fn: () => void) => {
    this.onOpenHandlers.push(fn);
  };

  deregisterOnOpen = (fn: () => void) => {
    this.onOpenHandlers.filter((h) => h != fn);
  };

  registerOnMessage = (fn: WSMessageHandler) => {
    this.onMessageHandlers.push(fn);
  };

  deregisterOnMessage = (fn: WSMessageHandler) => {
    this.onMessageHandlers.filter((h) => h != fn);
  };

  onOpen = () => {
    if (window.SETTINGS.DEBUG) {
      console.log("connected!");
    }
    for (let handler of this.onOpenHandlers) {
      handler();
    }
  };

  onMessage = (event: MessageEvent) => {
    const msg = JSON.parse(event.data);
    if (window.SETTINGS.DEBUG) {
      console.log(msg);
    }
    for (let handler of this.onMessageHandlers) {
      handler(msg);
    }
  };

  send = (message: any) => {
    this.state.ws.send(JSON.stringify(message));
  };

  render() {
    if (this.props.children) {
      return (
        <React.Fragment>{this.props.children({ ws: this })}</React.Fragment>
      );
    }
  }
}
