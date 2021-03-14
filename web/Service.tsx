import React from "react";
import { Link, useParams } from "react-router-dom";
import { gql } from "@apollo/client";
import { Container } from "@material-ui/core";
import { useServicePageQuery, useServicePagesQuery } from "./generated-types";
import { Error } from "./Error";
import Chat from "./components/Chat";
import WebSocketProvider from "~Websocket";

gql`
  query ServicePage($slug: String!) {
    services(slug: $slug) {
      edges {
        node {
          id
          pk
          slug
          title
          description
          streamLink
        }
      }
    }
  }
`;

gql`
  query ServicePages {
    services {
      edges {
        node {
          slug
          title
          description
        }
      }
    }
  }
`;

type ServiceProps = {
  ws: WebSocketProvider;
};

const Service: React.FC<ServiceProps> = (props) => {
  let { slug } = useParams();
  const { data, loading } = useServicePageQuery({
    variables: {
      slug,
    },
  });

  if (window.SETTINGS.DEBUG) {
    console.log(loading, data);
  }

  const page = data?.services?.edges?.[0]?.node;

  if (data && page != null) {
    return (
      <Container>
        <div style={{ display: "flex" }}>
          <div style={{ width: "70%" }}>
            <h1>{page.title}</h1>
            <h2>{page.streamLink}</h2>
          </div>
          <div style={{ width: "30%" }}>
            <Chat id={page.pk} ws={props.ws} />
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: page.description }} />
      </Container>
    );
  } else if (loading) {
    return <h1>loading</h1>;
  } else {
    return <Error />;
  }
};

type ServicesProps = {};

const Services: React.FC<ServicesProps> = () => {
  const { data, loading } = useServicePagesQuery({
    variables: {},
  });

  if (window.SETTINGS.DEBUG) {
    console.log(loading, data);
  }
  const pages = data?.services?.edges;

  if (data && pages) {
    return (
      <Container>
        <h1>Sunday Gatherings</h1>
        <p>
          We gather every Sunday as a community to be encouraged and reminded
          that we are not alone. Through praying, singing, sharing, learning,
          discussing and laughing together, our Sunday gatherings connect us to
          God and to each other, giving us a boost for the week to come!
        </p>
        <p>
          Some of the values that mark our gatherings include:
          <br />
          <br />
          <b>Informal:</b> Come as you are, not as you are ‘expected’ to be!
          <br />
          <b>Participatory:</b> Feel free to join the conversation, your voice
          is welcome!
          <br />
          <b>Authentic:</b> We want it to be real, not religious!
          <br />
          <b>Relevant:</b> Connecting God to the real stuff of your life!
          <br />
          <br />
          During COVID-19 we are meeting online only, through our website at
          10:30 a.m. EST on Sunday mornings, every Sunday morning! Please feel
          free to join us using the links on the Service links page or contact
          kyle@verhoog.ca for access! Our Ministry Centre is closed, but our
          ministry continues. In partnership with Johanne’s House, Southside
          Foodbank, John Howard Society, and other tremendous organizations, we
          seek to serve the Ajax community uninterrupted.
        </p>
        <React.Fragment>
          <ul>
            {pages.map((page: any, i: number) => (
              <li key={i}>
                <Link to={`/gathering/${page.node.slug}`}>
                  {page.node.title}
                </Link>
              </li>
            ))}
          </ul>
        </React.Fragment>
      </Container>
    );
  } else if (loading) {
    return <h1>loading</h1>;
  } else {
    return <Error />;
  }
};
export { Service, Services };
