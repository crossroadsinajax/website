import { gql } from "@apollo/client"
import React from "react"
import Button from "react-bootstrap/Button"
import Col from "react-bootstrap/Col"
import Container from "react-bootstrap/Container"
import ResponsiveEmbed from "react-bootstrap/ResponsiveEmbed"
import Row from "react-bootstrap/Row"
import Spinner from "react-bootstrap/Spinner"
import { Link } from "react-router-dom"
import { ParallaxProvider, ParallaxBanner } from "react-scroll-parallax"

import WebSocketProvider from "./Websocket"
import { HomePageQuery, useHomePageQuery } from "./generated-types"
import { Maybe } from "./types"

gql`
  query HomePage {
    currentService {
      slug
      title
    }
  }
`

const GatheringsFeature: React.FC<{
  service: Maybe<HomePageQuery["currentService"]>
}> = ({ service }) => {
  let content
  if (service) {
    content = (
      <>
        <p className="lead">
          Click below to view this week&apos;s service <b>{service.title}</b>:
        </p>
        <p>
          <Link to={`gathering/${service.slug}`}>
            <Button>View service &raquo;</Button>
          </Link>
        </p>
      </>
    )
  } else {
    content = <Spinner animation="border"></Spinner>
  }
  return (
    <>
      <h2>Gatherings</h2>
      {content}
    </>
  )
}

type HomeProps = {
  ws: WebSocketProvider
}

const Home: React.FC<HomeProps> = () => {
  const { data } = useHomePageQuery()

  return (
    <Container fluid>
      <ParallaxProvider>
        <Row>
          <ParallaxBanner
            layers={[
              {
                image: "/static/img/church.jpg",
                amount: 0.2,
              },
            ]}
            style={{
              height: "600px",
            }}
          >
            <Row
              className="featurette"
              style={{ background: "white", opacity: 0.9 }}
            ></Row>
          </ParallaxBanner>
        </Row>
        <Row
          style={{
            marginTop: "20px",
            marginBottom: "10px",
            paddingLeft: "20px",
            paddingRight: "20px",
          }}
        >
          <Col lg="4">
            <h2>Our Calling</h2>
            <p className="lead">
              Our calling is to help you and your loved ones Connect with Christ
              in Community, Live like Jesus, and Feel His Love.
            </p>
            <p>
              <Link to="/about/">
                <Button>Learn more &raquo;</Button>
              </Link>
            </p>
          </Col>
          <Col lg="4">
            <h2>Join us</h2>
            <p className="lead">
              We meet virtually every Sunday @ 10:30am and throughout the week
              right here on our website. We&apos;d love to have you join us!
            </p>
            <p>
              <Link to="/signup">
                <Button>Sign up &raquo;</Button>
              </Link>
            </p>
          </Col>
          <Col lg="4">
            <GatheringsFeature service={data?.currentService} />
          </Col>
        </Row>
        <Row>
          <ParallaxBanner
            layers={[
              {
                image: "/static/img/prayer.jpg",
                amount: 0.2,
              },
            ]}
            style={{
              height: "600px",
            }}
          ></ParallaxBanner>
        </Row>
        <Row
          className="featurette"
          style={{
            background: "white",
            opacity: 0.9,
            alignItems: "center",
            justifyContent: "center",
            top: 0,
            bottom: 0,
            paddingTop: "50px",
            paddingBottom: "50px",
            paddingLeft: "20px",
            paddingRight: "20px",
          }}
        >
          <Col
            className="f-center"
            lg="6"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <h2 className="featurette-heading">How we live</h2>
          </Col>
          <Col
            className="f-center"
            lg="6"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <p className="lead">
              Here at Crossroads, our calling is to help you and your loved ones
              Connect with Christ in Community, live like Jesus, and feel His
              Love. Our calling is to help you find yours in Christ.
            </p>
          </Col>
        </Row>
        <Row>
          <ParallaxBanner
            layers={[
              {
                image: "/static/img/newlife.jpg",
                amount: 0.2,
              },
            ]}
            style={{
              height: "600px",
            }}
          ></ParallaxBanner>
        </Row>
        <Row
          className="featurette"
          style={{
            background: "white",
            opacity: 0.9,
            alignItems: "center",
            justifyContent: "center",
            top: 0,
            bottom: 0,
            paddingTop: "50px",
            paddingBottom: "50px",
            paddingLeft: "20px",
            paddingRight: "20px",
          }}
        >
          <Col
            className="f-center"
            lg="6"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <p className="lead">
              We are ordinary people who struggle and live, just like you. We
              are still learning what it means to be like Jesus, and we find it
              hard to do. We make mistakes. We have moral struggles. But we are
              determined to change. We want to admit our sins and struggles, and
              we want to do something about them, with God’s help.
            </p>
          </Col>
          <Col
            className="f-center"
            lg="6"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <h2 className="featurette-heading">Who we are</h2>
          </Col>
        </Row>
        <Row>
          <ResponsiveEmbed aspectRatio="16by9">
            <iframe
              className="embed-responsive-item"
              src="https://www.youtube.com/embed/piRaZIOkJ4k"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </ResponsiveEmbed>
        </Row>
      </ParallaxProvider>
    </Container>
  )
}

export default Home
