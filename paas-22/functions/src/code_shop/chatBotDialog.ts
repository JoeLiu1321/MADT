import * as functions from "firebase-functions"
const dialogflow = require ("dialogflow")
import * as structjson from "./structjson"
import axios from "axios"

import { DIALOGFLOW, paymentServiceUrl } from "./insuranceConfig"
import { dialogAgent, publish } from "./dialogAgent"
import { DialogMessage } from "../dialogMessage"
import * as productService from "./productService"

const sessionClient = new dialogflow.SessionsClient({ keyFilename: DIALOGFLOW.path });
let product:any ;
let price:any;

export const messageDispatcher = (dialogMessage: DialogMessage|any): void => {
    const sessionId = dialogMessage.userId
    const sessionPath = sessionClient.sessionPath(DIALOGFLOW.projectId, sessionId)
    const queryInput = {
        text: {
            text: dialogMessage.userMessage.intent,
            languageCode: DIALOGFLOW.languageCode
        }
    }

    const request = {
        session: sessionPath,
        queryInput: queryInput
    }

    dialogMessage.agent = "dialogFlow"
    dialogAgent(request, dialogMessage).then(result => {
        if (result.action)
            actionDispatcher(result, dialogMessage)
    })
}

const actionDispatcher = async (queryResult:any, dialogMessage: DialogMessage|any): Promise<void> => {
    const parameters = structjson.structProtoToJson(queryResult.parameters) as any
    let events = []
    switch (queryResult.action) {
        case "welcome":
            events.push("showService")
            events.push("ask4Service")
            break
        case "ask4Service-class":
            events.push("showProducts")
            events.push("ask4Buy")
            break
        case "ask4Service-customer":
            dialogMessage.replyMessages[0].message = dialogMessage.replyMessages[0].message.replace('%{price}%', price)
            dialogMessage.replyMessages[0].message = dialogMessage.replyMessages[0].message.replace('%{product}%', product)
            dialogMessage.replyMessages[0].message = dialogMessage.replyMessages[0].message.replace('%{price}%', price)
            publish(dialogMessage)
            events.push("reAsk")
            break
        case "ask4Service-owner.ask4Service-owner-custom":
            dialogMessage.replyMessages[0].message = dialogMessage.replyMessages[0].message.replace('%{price}%', price)
            dialogMessage.replyMessages[0].message = dialogMessage.replyMessages[0].message.replace('%{product}%', product)
            dialogMessage.replyMessages[0].message = dialogMessage.replyMessages[0].message.replace('%{price}%', price)
            publish(dialogMessage)
            events.push("reAsk")
            break
        case "buyProduct":
            product = parameters.product
            price = productService.getPrice(parameters.product)
            dialogMessage.replyMessages[0].message = dialogMessage.replyMessages[0].message.replace('%{price}%', price)
            publish(dialogMessage)
            break
        case "transfer":
            axios.post(paymentServiceUrl + "handOverToPayment", {
                shopMessage: {
                    channel: dialogMessage.channel,
                    userId: dialogMessage.userId,
                    event: "ask4Pay",
                    product: {
                        name: product,
                        price: price
                    }
                }
            })
            break
        case "error":
            events.push("showService")
            events.push("ask4Service")
            break
    }

    if (events.length) {
        const sessionId = dialogMessage.userId
        const sessionPath = sessionClient.sessionPath(DIALOGFLOW.projectId, sessionId)
        for (const event of events) {
            const queryInput = {
                event: {
                    name: event,
                    languageCode: DIALOGFLOW.languageCode
                }
            }

            const request = {
                session: sessionPath,
                queryInput: queryInput
            }
            console.log(event)
            dialogMessage.agent = "dialogFlow"
            let result = await dialogAgent(request, dialogMessage)
            if (result.action)
                actionDispatcher(result, dialogMessage)
        }
    }
}

export const handOverToShop = functions.https.onRequest((req, res) => {
    const shopMessage = req.body.shopMessage
    const dialogMessage: DialogMessage = {
        channel: shopMessage.channel,
        userId: shopMessage.userId
    }
    const sessionId = dialogMessage.userId
    const sessionPath = sessionClient.sessionPath(DIALOGFLOW.projectId, sessionId)
    const queryInput = {
        event: {
            name: shopMessage.event,
            languageCode: DIALOGFLOW.languageCode
        }
    }
    const request = {
        session: sessionPath,
        queryInput: queryInput
    }
    dialogMessage.agent = "dialogFlow"
    dialogAgent(request, dialogMessage).then(result => {
        if (result.action)
            actionDispatcher(result, dialogMessage)
    })
    res.sendStatus(200)
})