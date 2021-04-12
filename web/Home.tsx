import React from "react"
import Container from "react-bootstrap/Container"
import { Parallax } from "react-parallax"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import WebSocketProvider from "./Websocket"

type HomeProps = {
  ws: WebSocketProvider
}

const Home: React.FC<HomeProps> = () => {
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
            We meet every Sunday, 10:30am at Bolton C. Falby Public School.
            We&apos;d love to have you join us.
          </p>
          <p>
            <a className="btn btn-secondary" href="#" role="button">
              View directions &raquo;
            </a>
          </p>
        </Col>
        <Col lg="4">
          <h2>Our Calling</h2>
          <p className="lead">
            Our calling is to help you and your loved ones Connect with Christ
            in Community, Live like Jesus, and Feel His Love.
          </p>
          <p>
            <a className="btn btn-secondary" href="#" role="button">
              View details &raquo;
            </a>
          </p>
        </Col>
        <Col lg="4">
          <h2>Services</h2>
          <p className="lead">
            We support and run our services digitally just as we do in real
            life. Click below to view this week&apos;s service:
          </p>
          <p>
            <a className="btn btn-secondary" href="" role="button">
              View service &raquo;
            </a>
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
