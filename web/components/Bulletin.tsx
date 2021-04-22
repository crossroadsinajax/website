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

const BulletinItem: React.FC<{bulletinItem: String}> = ({bulletinItem}) => {
    return (
        // <div class="card" style="">
        // <div class="card-body">
        //     <h5 class="card-title">{{ value.title }}</h5>
        //     {% if value.date %}
        //     <h6 class="card-subtitle">{{ value.date }}</h6>
        //     {% endif %}
        //     <p class="card-text">
        //     {{ value.body }}
        //     </p>
        // </div>
        // {% if value.contact_name %}
        // <div class="card-footer">
        //     <p class="card-text">
        //     Contact {{ value.contact_name }}
        //     {% if value.contact_email or value.contact_phone %}
        //         at <a href="mailto:{{ value.contact_email }}"> {{ value.contact_email }} </a>
        //         {% if value.contact_email and value.contact_phone %}
        //         or
        //         {% endif %}
        //         {{ value.contact_phone }}
        //     {% endif %}
        //         for more detail.
        //     </p>
        // </div>
        // {% endif %}
        // </div>
        <div>bulletinItem</div>
    )
}


const BulletinSection: React.FC<{
    section: BulletinSectionProp
  }> = ({ section }) => {
    return (
        // <div class="">
        // <a href="#collapseBulletin" data-toggle="collapse" role="button" aria-controls="collapseBulletin" class="" style="color: black;">
        //     <h2>Bulletin <span class="float-right">{% octicon "chevron-down" width=25 height=25 %}</span></h2>
        // </a>
        // <div id="collapseBulletin" class="panel-collapse">
        //     <div class="card-columns">
        //     {% for item in value.items %}
        //         {% include_block item %}
        //     {% endfor %}
        //     </div>
        // </div>
        // </div>
        <div>{section.title}</div>
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
    id: string,
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

    
    let bulletinSection: BulletinSectionProp = {
        id: bulletin['id'],
        bulletins: bulletinItems,
        title: bulletin['title'],
    }
    console.log(bulletin)
    return (
      <BulletinSection section={bulletinSection} />
    )
  }
