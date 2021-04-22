import moment from "moment"
import React, { useMemo, useRef, useState } from "react"
import Button from "react-bootstrap/Button"
import Dropdown from "react-bootstrap/Dropdown"
import Nav from "react-bootstrap/Nav"
import Overlay from "react-bootstrap/Overlay"
import Tab from "react-bootstrap/Tab"
import Tooltip from "react-bootstrap/Tooltip"
import styled from "styled-components"
import { UserType } from "~/generated-types"
import WebSocketProvider, { WSMessage } from "~Websocket"

const BulletinItem: React.FC<{bulletinItem: BulletinItemProp}> = ({bulletinItem}) => {
    let cardText: any[] = ["Contact ", bulletinItem.contactName]
    if (bulletinItem.contactEmail || bulletinItem.contactPhone) {
        cardText.push(" at ")
        cardText.push(<a href={`mailto:${bulletinItem.contactEmail}`}> { bulletinItem.contactEmail } </a>)
        if (bulletinItem.contactPhone) {
            cardText.push(" or ")
            cardText.push(bulletinItem.contactPhone)
        }
        cardText.push(" for more detail.")
    }
    return (
        <div className="card">
        <div className="card-body">
            <h5 className="card-title">{ bulletinItem.title }</h5>
            {bulletinItem.date && bulletinItem.date !== "" && <h6 className="card-subtitle">{ bulletinItem.date }</h6>}
            <p className="card-text" dangerouslySetInnerHTML={{ __html: bulletinItem.body }}>
            </p>
        </div>
        {
            bulletinItem.contactName &&
            <div className="card-footer">
            <p className="card-text">
            {cardText}
            </p>
            </div>
        }
        </div>
    )
}


const BulletinSection: React.FC<{
    section: BulletinSectionProp
  }> = ({ section }) => {
    let items = section.bulletins
    let itemsTpl = []
    for (let i = 0; i < items.length; i++) {
        itemsTpl.push(<BulletinItem bulletinItem={items[i]} />);
    }
    return (
        <div>
        <a href="#collapseBulletin" data-toggle="collapse" role="button" aria-controls="collapseBulletin" style={{ color: "black" }}>
            <h2>{section.title}</h2>
        </a>
        <div id="collapseBulletin" className="panel-collapse">
            <div className="card-columns">
            {itemsTpl}
            </div>
        </div>
        </div>
    )
  }

type BulletinItemProp = {
    body: string,
    contactEmail: string,
    contactName: string,
    contactPhone: string,
    date: string,
    title: string,
}

type BulletinSectionProp = {
    title: string,
    bulletins: BulletinItemProp[],
}

export const Bulletin: React.FC<{
   bulletinStr: string
  }> = ({ bulletinStr }) => {
    let bulletin = null
    try {
        bulletin = JSON.parse(bulletinStr)
    } catch (e) {
        console.error("error parsing bulletin string: " + bulletinStr)
        console.error(e)
        return (
            <div></div>
        )
    }

    var bulletinSection: BulletinSectionProp 
    try {
        let bulletinItems: BulletinItemProp[] = []
        bulletin['value']['items'].forEach((e: { [x: string]: any }) => {
            let bti: BulletinItemProp = {
                body: e['body'],
                contactEmail: e['contact_email'],
                contactName: e['contact_name'],
                contactPhone: e['contact_phone'],
                date: e['date'],
                title: e['title'],
            }
            bulletinItems.push(bti)
        });

        bulletinSection = {
            bulletins: bulletinItems,
            title: bulletin['value']['title'],
        }
    } catch (e) {
        console.error("error parsing bulletin obj: " + bulletinStr)
        console.error(e)
        return (
            <div></div>
        )
    }

    return (
      <BulletinSection section={bulletinSection} />
    )
  }
