import React from "react";
import clsx from "clsx";
import {
  Button,
  Container,
  FormControl,
  TextField,
  makeStyles,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  margin: {
    margin: theme.spacing(1),
  },
  withoutLabel: {
    marginTop: theme.spacing(3),
  },
  textField: {
    width: "25ch",
  },
}));

type AuthProps = {};

const Auth: React.FC<AuthProps> = () => {
  const classes = useStyles();
  return (
    <Container>
      <h1>Log in</h1>
      <form>
        <FormControl
          className={clsx(
            classes.margin,
            classes.withoutLabel,
            classes.textField
          )}
        >
          <TextField
            label="Username"
            className={clsx(classes.margin, classes.textField)}
            variant="outlined"
          />
        </FormControl>
        <FormControl
          className={clsx(
            classes.margin,
            classes.withoutLabel,
            classes.textField
          )}
        >
          <TextField
            id="outlined-password-input"
            label="Password"
            className={clsx(classes.margin, classes.textField)}
            type="password"
            autoComplete="current-password"
            variant="outlined"
          />
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          className={clsx(classes.margin)}
        >
          Log in
        </Button>
      </form>
    </Container>
  );
};

export default Auth;
