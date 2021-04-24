import {
  ApolloClient,
  ApolloProvider,
  ApolloLink,
  InMemoryCache,
  HttpLink,
} from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { onError } from "@apollo/client/link/error"
import React from "react"
import ReactDOM from "react-dom"
import "react-hot-loader"

import { App } from "./App"
import WebsocketProvider from "./Websocket"
import "./index.html"

declare global {
  /* eslint-disable no-unused-vars  */
  interface Window {
    CSRF_TOKEN: string
    SETTINGS: {
      PROD: boolean
    }
  }
}

const authLink = setContext((_, { headers }) => {
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: window.CSRF_TOKEN ? `Bearer ${window.CSRF_TOKEN}` : "",
    },
  }
})

const client = new ApolloClient({
  link: authLink.concat(
    ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path }) =>
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
          )
        if (networkError) console.log(`[Network error]: ${networkError}`)
      }),
      new HttpLink({ uri: "/gql/" }),
    ])
  ),
  cache: new InMemoryCache(),
})

const WS_PROTO = window.location.protocol == "https:" ? "wss" : "ws"
const WS_URL = `${WS_PROTO}://${window.location.host}/ws/`

ReactDOM.render(
  <ApolloProvider client={client}>
    <WebsocketProvider url={WS_URL}>
      {(props) => <App ws={props.ws} />}
    </WebsocketProvider>
  </ApolloProvider>,
  document.getElementById("react-app")
)
