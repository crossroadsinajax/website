import React from "react"
import Container from "react-bootstrap/Container"

import Title from "./Title"

type GivingProps = {}

const Giving: React.FC<GivingProps> = () => {
  return (
    <Container className="mt-4">
      <Title text="Giving" />
      <div className="text-center">
        <h1>Giving</h1>
        <p className="lead">
          There are multiple ways to donate to support Crossroads and its
          ministries
        </p>
      </div>
      <Container className="mt-4">
        <div className="card-deck mb-3 text-center">
          <div className="card mb-4 shadow-sm">
            <div className="card-header">
              <h4>Paypal</h4>
            </div>
            <div className="card-body">
              <form
                className="mt-2"
                action="https://www.paypal.com/cgi-bin/webscr"
                method="post"
                target="_top"
              >
                <input type="hidden" name="cmd" value="_s-xclick" />
                <input
                  type="hidden"
                  name="hosted_button_id"
                  value="4QK9PVMWKV9ZE"
                />
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
            </div>
          </div>
          <div className="card mb-4 shadow-sm">
            <div className="card-header">
              <h4>PAR</h4>
            </div>
            <div className="card-body">
              <p>Pre-authorized Remittance</p>
              <p>Contact Lynn for more details.</p>
            </div>
          </div>
          <div className="card mb-4 shadow-sm">
            <div className="card-header">
              <h4>E-Transfer</h4>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-4">
                <li>
                  Send to{" "}
                  <a href="mailto:donate@crossroadsinajax.org">
                    donate@crossroadsinajax.org
                  </a>
                </li>
                <li>
                  or send directly to the Deaconate fund{" "}
                  <a href="mailto:deacons.fund@crossroadsinajax.org">
                    deacons.fund@crossroadsinajax.org
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      <h2>Administrator Contact</h2>
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
