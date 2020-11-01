import React from "react";
import { useQuery } from "react-apollo";
import gql from "graphql-tag";
import { Box, makeStyles } from "@material-ui/core";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
    position: "relative",
  },
});

export const GET_USER_DATA = gql`
  query {
    currentUser {
      username
      firstName
      lastName
    }
  }
`;

type HomeProps = {};

const Home: React.FC<HomeProps> = (props) => {
  const { data, loading } = useQuery(GET_USER_DATA);
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <h1>
        {data?.currentUser?.firstName ?? "kyle"}
        is a 🍑 dalskjfal
      </h1>
    </Box>
  );
};

export default Home;
