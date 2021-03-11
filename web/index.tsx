import "react-hot-loader"; // Has to be imported before react + react-dom
import {
  ApolloClient,
  ApolloProvider,
  ApolloLink,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";

import "./index.html";
import { ThemeProvider, CssBaseline, createMuiTheme } from "@material-ui/core";

declare global {
  /* eslint-disable no-unused-vars  */
  interface Window {
    CSRF_TOKEN: string;
    SETTINGS: {
      DEBUG: boolean;
    };
  }
}

const authLink = setContext((_, { headers }) => {
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: window.CSRF_TOKEN ? `Bearer ${window.CSRF_TOKEN}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(
    ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path }) =>
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
          );
        if (networkError) console.log(`[Network error]: ${networkError}`);
      }),
      new HttpLink({ uri: "/gql/" }),
    ])
  ),
  cache: new InMemoryCache(),
});

const theme = createMuiTheme({
  palette: {
    type: "light",
  },
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <App />
      </CssBaseline>
    </ThemeProvider>
  </ApolloProvider>,
  document.getElementById("react-app")
);
