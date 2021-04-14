import React from "react"
import Container from "react-bootstrap/Container"

type AuthProps = {}

const Auth: React.FC<AuthProps> = () => {
  return (
    <Container>
      <h1>Log in</h1>
    </Container>
  )
}

type SignupProps = {}

const Signup: React.FC<SignupProps> = () => {
  return (
    <Container>
      <h1>Sign up</h1>
      <p>
        Please send an email to{" "}
        <a href="mailto:kyle@crossroadsajax.church">
          kyle@crossroadsajax.church
        </a>{" "}
        to be added to the site.
      </p>
    </Container>
  )
}

export { Auth, Signup }
