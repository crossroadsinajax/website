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
        <h1>Services</h1>
        <React.Fragment>
          <ul>
            {pages.map((page: any, i: number) => (
              <li key={i}>
                <Link to={`/service/${page.node.slug}`}>{page.node.title}</Link>
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
