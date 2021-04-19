import React from "react"
import Container from "react-bootstrap/Container"

import Title from "./Title"

type GivingProps = {}

const Giving: React.FC<GivingProps> = () => {
  return (
    <Container>
      <Title text="Giving" />
      <h1>Giving</h1>
      <p>
        There are multiple ways to donate to support Crossroads and its
        ministries
      </p>

      <h2>Paypal</h2>
      <form
        action="https://www.paypal.com/cgi-bin/webscr"
        method="post"
        target="_top"
      >
        <input type="hidden" name="cmd" value="_s-xclick" />
        <input type="hidden" name="hosted_button_id" value="4QK9PVMWKV9ZE" />
        <input
          type="image"
          src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"
          name="submit"
          title="PayPal - The safer, easier way to pay online!"
          alt="Donate with PayPal button"
        />
        <img
          alt=""
          src="https://www.paypal.com/en_CA/i/scr/pixel.gif"
          width="1"
          height="1"
        />
      </form>

      <h2>Pre-authorized Remittance (PAR)</h2>
      <p>Contact the administrator (see below) for more details</p>

      <h2>Interac E-Transfer</h2>
      <ul>
        <li>
          Sign in to your preferred bank&apos;s Online Banking and click
          &quot;send E-Transfer&quot;
        </li>
        <li>
          Send to{" "}
          <a href="mailto:lynn@crossroadsinajax.org">
            lynn@crossroadsinajax.org
          </a>
        </li>
        <li>Notify Lynn via email of the amount and Ministry focus if any.</li>
      </ul>

      <h2>Contact Administrator</h2>
      <p>
        Lynn Jackson
        <br />
        <a href="mailto:lynn@crossroadsinajax.org">lynn@crossroadsinajax.org</a>
        <br />
        905-426-4962
      </p>
    </Container>
  )
}

export default Giving
