import { hot } from "react-hot-loader/root"; // has to be imported before react and react-dom
import React from "react";
import { gql } from "@apollo/client";
import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Auth from "./Auth";
import Home from "./Home";
import Giving from "./Giving";
import { Service, Services } from "./Service";

import { useUserQuery } from "./generated-types";
import WebSocketProvider from "./Websocket";

type AppProps = {
  ws: WebSocketProvider;
};

gql`
  query User {
    currentUser {
      username
      firstName
      lastName
    }
  }
`;

const AppBase: React.FC<AppProps> = (props) => {
  const { data, loading } = useUserQuery();
  console.log(loading, data);

  return (
    <React.Fragment>
      <Helmet>
        <title>Crossroads</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
      <Router>
        <Navbar user={data?.currentUser} />
        <div style={{ marginTop: 75 }}>
          <Switch>
            <Route path="/services">
              <Services />
            </Route>
            <Route path="/service/:slug">
              <Service ws={props.ws} />
            </Route>
            <Route path="/give">
              <Giving />
            </Route>
            <Route path="/login">
              <Auth />
            </Route>
            <Route path="/">
              <Home ws={props.ws} />
            </Route>
          </Switch>
        </div>
      </Router>
    </React.Fragment>
  );
};

export const App = hot(AppBase);
