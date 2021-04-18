import { gql } from "@apollo/client"
import React from "react"
import Container from "react-bootstrap/Container"
import Nav from "react-bootstrap/Nav"
import NavDropdown from "react-bootstrap/NavDropdown"
import Navbar from "react-bootstrap/Navbar"
import { Helmet } from "react-helmet"
import { hot } from "react-hot-loader/root"
import { Link } from "react-router-dom"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import { UserType } from "~/generated-types"
import { Maybe } from "~/types"

import { AboutUs, Beliefs, Becoming, Contact } from "./About"
import { Auth, Signup } from "./Auth"
import Giving from "./Giving"
import Home from "./Home"
import { Service, Services } from "./Service"
import WebSocketProvider from "./Websocket"
import { useUserQuery } from "./generated-types"

type AppProps = {
  ws: WebSocketProvider
}

gql`
  query User {
    currentUser {
      username
      firstName
      lastName
      isChatmod
    }
  }
`

type HeaderProps = {
  user: Maybe<UserType>
}

const Header: React.FC<HeaderProps> = (props) => {
  const { user } = props
  return (
    <Navbar expand="lg" bg="light" style={{ padding: "0rem 1rem" }}>
      <Container>
        <Navbar.Brand>
          <Link to="/">
            <img
              src="/static/img/crossroads.png"
              style={{ maxWidth: "100px" }}
            />
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link as={Link} to="/gatherings">
              Gatherings
            </Nav.Link>
            <NavDropdown title="About us" id="about-nav-dropdown">
              <NavDropdown.Item as={Link} to="/about/">
                Who we are
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/about/beliefs">
                Our beliefs
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/about/become-a-christian">
                Becoming a Christian
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/give">
              Giving
            </Nav.Link>
            <Nav.Link as={Link} to="/contact">
              Contact us
            </Nav.Link>
            {user && (
              <NavDropdown title={user.username} id="profile-dropdown">
                <NavDropdown.Item as={Link} to="/profile/">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/logout">
                  Log out
                </NavDropdown.Item>
              </NavDropdown>
            )}
            {!user && (
              <Nav.Link as={Link} to="/login">
                Log in
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

const AppBase: React.FC<AppProps> = (props) => {
  const { data } = useUserQuery()

  let user = null
  if (data) {
    user = data.currentUser
  }

  return (
    <React.Fragment>
      <Helmet>
        <title>Crossroads Community Church</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Welcome to Crossroads Community Church!"
        />
      </Helmet>
      <Router>
        <Header user={user} />
        <Switch>
          <Route path="/gatherings">
            <Services />
          </Route>
          <Route path="/gathering/:slug">
            <Service user={user} ws={props.ws} />
          </Route>
          <Route path="/give/">
            <Giving />
          </Route>
          <Route path="/contact/">
            <Contact />
          </Route>
          <Route path="/about/become-a-christian">
            <Becoming />
          </Route>
          <Route path="/about/beliefs">
            <Beliefs />
          </Route>
          <Route path="/about/">
            <AboutUs />
          </Route>
          <Route path="/login">
            <Auth />
          </Route>
          <Route path="/signup">
            <Signup />
          </Route>
          <Route path="/">
            <Home ws={props.ws} />
          </Route>
        </Switch>
      </Router>
    </React.Fragment>
  )
}

export const App = hot(AppBase)
