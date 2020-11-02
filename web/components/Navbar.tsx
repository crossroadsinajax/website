import React from "react";
import { Link } from "react-router-dom";
import { Box, makeStyles } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import { common } from "@material-ui/core/colors";
import Toolbar from "@material-ui/core/Toolbar";
import { MenuTab } from "./MenuTab";

const useStyles = makeStyles({
  navbar: {
    background: common.white,
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
  },
  image: {
    maxWidth: "100px",
  },
  tabs: {
    color: common.black,
    display: "flex",
  },
});

type NavbarProps = {
  user: any;
};
export const Navbar: React.FC<NavbarProps> = (props) => {
  const classes = useStyles();
  return (
    <AppBar className={classes.navbar}>
      <Toolbar className={classes.toolbar}>
        <Link to="/">
          <Box ml={2}>
            <img src="/static/img/crossroads.png" className={classes.image} />
          </Box>
        </Link>
        <Box className={classes.tabs}>
          <MenuTab
            name="Connecting"
            pages={["Example 1", "Example 2"]}
          ></MenuTab>
          <MenuTab name="Contact Us" pages={["Office", "Directions"]}></MenuTab>
          <Link to="/give">
            <MenuTab name="Giving" pages={[]}></MenuTab>
          </Link>
          {props.user && (
            <Link to="/profile">
              <MenuTab name={props.user.username} pages={[]}></MenuTab>
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
