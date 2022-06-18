import React, { useMemo, useRef, useState } from "react"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import styled from "styled-components"
import { UserType } from "~/generated-types"
import WebSocketProvider, { WSMessage } from "~Websocket"

const PollModal = styled(Modal)`
  width: 90%;
`

const PollOverlay: React.FC<{}> = ({}) => {
  const [show, setShow] = useState(true)
  return (
    <>
      <Button variant="primary" onClick={() => setShow(true)}>
        Custom Width Modal
      </Button>
      <PollModal
        dialogClassName="modal-90w"
        show={show}
        onHide={() => setShow(false)}
        fullscreen="true"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            Custom Modal Styling
          </Modal.Title>
        </Modal.Header>
        <Modal.Body></Modal.Body>
      </PollModal>
    </>
  )
}

export const Poll = styled(PollOverlay)``
