import { gql } from "@apollo/client"
import { parse, format } from "date-fns"
import React from "react"
import Container from "react-bootstrap/Container"
import Spinner from "react-bootstrap/Spinner"
import { Link } from "react-router-dom"

import Title from "./Title"
import { useServicePagesQuery } from "./generated-types"

gql`
  query ServicePages {
    services {
      edges {
        node {
          date
          description
          slug
          title
        }
      }
    }
  }
`

type ServicesProps = {}

const ServicesPage: React.FC<ServicesProps> = () => {
  const { data, loading } = useServicePagesQuery({
    variables: {},
  })

  if (!window.SETTINGS.PROD) {
    console.log(loading, data)
  }
  const pages = data?.services?.edges
  let listing
  if (pages) {
    listing = (
      <>
        {pages.map((page: any, i: number) => (
          <div className="card" key={i}>
            <div className="card-body">
              <div className="card-title">
                <h5>
                  <Link to={`/gathering/${page.node.slug}`}>
                    {page.node.title}
                  </Link>
                </h5>
                <div className="card-subtitle">
                  <p>
                    {format(
                      parse(page.node.date, "yyyy-MM-dd", new Date()),
                      "MMM. d, yyyy"
                    )}
                  </p>
                </div>
                <p
                  className="card-text"
                  dangerouslySetInnerHTML={{ __html: page.node.description }}
                ></p>
              </div>
            </div>
          </div>
        ))}
      </>
    )
  } else {
    listing = <Spinner animation="border" />
  }

  return (
    <Container className="mt-4">
      <Title text="Gatherings" />
      <h1>Sunday Gatherings</h1>
      <p>
        We gather every Sunday as a community to be encouraged and reminded that
        we are not alone. Through praying, singing, sharing, learning,
        discussing and laughing together, our Sunday gatherings connect us to
        God and to each other, giving us a boost for the week to come!
      </p>
      <p>
        Some of the values that mark our gatherings include:
        <br />
        <br />
        <b>Informal:</b> Come as you are, not as you are ‘expected’ to be!
        <br />
        <b>Participatory:</b> Feel free to join the conversation, your voice is
        welcome!
        <br />
        <b>Authentic:</b> We want it to be real, not religious!
        <br />
        <b>Relevant:</b> Connecting God to the real stuff of your life!
        <br />
        <br />
        We meet in-person at our Ministry Centre as well as online right here at
        10:30 a.m. EST every Sunday morning! Please feel free to join us by{" "}
        <Link to="/signup">signing up</Link>.
      </p>
      {listing}
    </Container>
  )
}

export { ServicesPage }
