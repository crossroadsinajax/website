import React from "react"
import Container from "react-bootstrap/Container"

const AboutUs: React.FC<{}> = () => {
  return (
    <Container>
      <h1>About us</h1>
      <p>
        Crossroads Community Church has been in Ajax since 1995. Since 2009 we
        have been meeting at Bolton C. Falby Public School, which is at Falby
        Court in Ajax, ON. Crossroads is a member of the Christian Reformed
        Church in Canada, a Protestant denomination.
      </p>
      <p>
        The area surrounding Falby Court is a diversely populated area with a
        blend of young families and seniors, both new to Canada and established.
        Both the privileged and the underserved in our community have material
        needs. The needs are great, but God is greater. He is at work here. As
        followers of Jesus Christ we are committed to working with Him — not
        just building a church but building a community in Christ! We believe
        that God began this good work here, and He will see it through to
        completion!
      </p>
      <br />
      <b>Connecting</b> people with Jesus
      <br />
      <b>Becoming</b> like Him, and
      <br />
      <b>Demonstrating</b> His love!
      <br />
      <br />
      <p>
        What does this mean? A disciple is a follower of Jesus, someone that is…
      </p>
      <ul>
        <li>CONNECTED to Jesus through a close, personal relationship,</li>
        <li>BECOMING more like Jesus in character and purpose,</li>
        <li>
          DEMONSTRATING the kind of love that Jesus did, for God and for people.
        </li>
      </ul>
      <br />
      <p>
        We are first of all committed to being disciples, and find our purpose
        by helping others find theirs through mentoring and discipleship.
      </p>
      <p>
        We are convinced the world would be a better place if people actually
        lived and loved like Jesus did. To that end, we have a vision for making
        disciples here in our own community. That vision is tied to where God
        has placed us in downtown Ajax.
      </p>
    </Container>
  )
}

const Beliefs: React.FC<{}> = () => {
  return (
    <Container>
      <h1>Our beliefs</h1>
      <p></p>
    </Container>
  )
}

const Becoming: React.FC<{}> = () => {
  return (
    <Container>
      <h1>Becoming a Christian</h1>
    </Container>
  )
}

const Contact: React.FC<{}> = () => {
  return (
    <Container>
      <h1>Contact us</h1>
    </Container>
  )
}

export { AboutUs, Beliefs, Becoming, Contact }
