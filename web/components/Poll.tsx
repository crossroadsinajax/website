import React, { useMemo, useRef, useState } from "react"
import Modal from "react-bootstrap/Modal"

import { UserType } from "~/generated-types"
import WebSocketProvider, { WSMessage } from "~Websocket"



export const PollOverlay: React.FC<{}> = ({}) => {
    return <Modal show={true} fullscreen/>
}


