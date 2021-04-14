import { gql } from "@apollo/client"
import React from "react"
import { Link } from "react-router-dom"
import Container from "react-bootstrap/Container"
import { Parallax } from "react-parallax"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import WebSocketProvider from "./Websocket"
import { useHomePageQuery } from "./generated-types"

gql`
  query HomePage {
    currentService {
      title
      slug
    }
  }
`

type HomeProps = {
  ws: WebSocketProvider
}

const Home: React.FC<HomeProps> = () => {
  const { data, loading } = useHomePageQuery()

  if (loading || !data) {
    return <h1>Loading...</h1>
  }

  const { currentService } = data

  return (
    <Container fluid>
      <Parallax bgImage="/static/img/church.jpg" strength={-100}>
        <div style={{ height: "600px" }}>
          {/*
          <div style={{
            background: "white",
            padding: 20,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}>
            <h1>
              Welcome to Crossroads
            </h1>
          </div>
        */}
        </div>
      </Parallax>
      <Row
        style={{
          marginTop: "20px",
          marginBottom: "10px",
        }}
      >
        <Col lg="4">
          <h2>Join us</h2>
          <p className="lead">
            We meet virtually every Sunday, 10:30am and throughout the week
            right here on our website. We&apos;d love to have you join us!
          </p>
          <p>
            <Link to="/signup">
              <a className="btn btn-secondary" href="#" role="button">
                Sign up &raquo;
              </a>
            </Link>
          </p>
        </Col>
        <Col lg="4">
          <h2>Our Calling</h2>
          <p className="lead">
            Our calling is to help you and your loved ones Connect with Christ
            in Community, Live like Jesus, and Feel His Love.
          </p>
          <p>
            <Link to="/about/">
              <a className="btn btn-secondary" href="#" role="button">
                Learn more &raquo;
              </a>
            </Link>
          </p>
        </Col>
        <Col lg="4">
          <h2>Gatherings</h2>
          <p className="lead">
            Click below to view this week&apos;s service{" "}
            <b>{currentService.title}</b>:
          </p>
          <p>
            <Link to={`gathering/${currentService.slug}`}>
              <a className="btn btn-secondary" role="button">
                View service
              </a>
            </Link>
          </p>
        </Col>
      </Row>
      <Parallax bgImage="/static/img/prayer.jpg" strength={-100}>
        <div style={{ height: "600px" }}></div>
      </Parallax>
    </Container>
  )
}

export default Home
