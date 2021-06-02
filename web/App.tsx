import { gql } from "@apollo/client"
import React, { useLayoutEffect } from "react"
import Col from "react-bootstrap/Col"
import Container from "react-bootstrap/Container"
import Nav from "react-bootstrap/Nav"
import NavDropdown from "react-bootstrap/NavDropdown"
import Navbar from "react-bootstrap/Navbar"
import Row from "react-bootstrap/Row"
import { Helmet } from "react-helmet"
import { hot } from "react-hot-loader/root"
import { Link, useLocation } from "react-router-dom"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import styled from "styled-components"
import { UserType } from "~/generated-types"
import { Maybe } from "~/types"

import { AboutUs, Beliefs, Becoming, Contact } from "./About"
import { Auth, Signup } from "./Auth"
import Giving from "./Giving"
import Home from "./Home"
import { ServicePage } from "./Service"
import { ServicesPage } from "./Services"
import WebSocketProvider from "./Websocket"
import { useUserQuery } from "./generated-types"

type AppProps = {
  ws: WebSocketProvider
}

gql`
  query User {
    org {
      pk
      name
    }
    currentUser {
      username
      firstName
      lastName
      isChatmod
    }
  }
`

const CrossroadsHeader: React.FC<{
  user: Maybe<UserType>
}> = (props) => {
  const { user } = props
  return (
    <Navbar expand="lg" style={{ padding: "0rem 1rem" }}>
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

const _Footer = styled.footer`
  ul {
    list-style-type: none;
  }
`

const CrossroadsFooter: React.FC<{}> = () => {
  return (
    <_Footer className="mt-5 pt-4 pb-2 bg-light border-top">
      <Container>
        <Row>
          <Col lg="5" xs="12">
            <h2>Crossroads Community Church</h2>
            <p>Learning to love God, each other and all people!</p>
          </Col>
          <Col lg="3" xs="12">
            <h4>Links</h4>
            <ul className="m-0 p-0">
              <li>
                - <Link to="/about">About us</Link>
              </li>
              <li>
                - <Link to="/gatherings">Gatherings</Link>
              </li>
              <li>
                - <Link to="/give">Giving</Link>
              </li>
            </ul>
          </Col>
          <Col lg="4" xs="12">
            <h4>Location</h4>
            <p>520 Westney Rd South | Ajax, Ontario | L1S6W6</p>
            <p>
              <a href="mailto:lynn@crossroadsajax.church">
                lynn@crossroadsajax.church
              </a>
            </p>
            <p>905-426-4962</p>
          </Col>
        </Row>
      </Container>
    </_Footer>
  )
}

const CrossroadsApp: React.FC<{
  user: Maybe<UserType>
  ws: WebSocketProvider
}> = ({ user, ws }) => {
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
      <CrossroadsHeader user={user} />
      <Switch>
        <Route path="/gatherings">
          <ServicesPage />
        </Route>
        <Route path="/gathering/:slug">
          <ServicePage user={user} ws={ws} />
        </Route>
        <Route path="/services/:slug">
          <ServicePage user={user} ws={ws} />
        </Route>
        <Route path="/services">
          <ServicesPage />
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
          <Home ws={ws} />
        </Route>
      </Switch>
      <CrossroadsFooter />
    </React.Fragment>
  )
}

const MaranathaApp: React.FC<{
  user: Maybe<UserType>
  ws: WebSocketProvider
}> = ({ user, ws }) => {
  return (
    <React.Fragment>
      <Helmet>
        <title>maranatha</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Welcome to the Maranatha stream!" />
      </Helmet>
      <Navbar expand="lg" style={{ padding: "0rem 1rem" }}>
        <Container>
          <Navbar.Brand>
            <a href="https://www.maranathacrc.com">
              <img
                src="/static/img/maranatha.jpg"
                style={{ maxWidth: "300px" }}
              />
            </a>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ml-auto">
              {user && (
                <NavDropdown title={user.username} id="profile-dropdown">
                  <NavDropdown.Item as={Link} to="/logout">
                    Log out
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Switch>
        <Route path="/gathering/:slug">
          <ServicePage user={user} ws={ws} />
        </Route>
        <Route path="/services/:slug">
          <ServicePage user={user} ws={ws} />
        </Route>
      </Switch>
    </React.Fragment>
  )
}

const AppBase: React.FC<AppProps> = (props) => {
  const { data } = useUserQuery()
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  const user = data?.currentUser
  const org = data?.org

  if (org && org.name == "maranatha") {
    return <MaranathaApp user={user} ws={props.ws} />
  } else {
    return <CrossroadsApp user={user} ws={props.ws} />
  }
}

const RouterApp: React.FC<{
  ws: WebSocketProvider
}> = ({ ws }) => {
  return (
    <Router>
      <AppBase ws={ws} />
    </Router>
  )
}

export const App = hot(RouterApp)
