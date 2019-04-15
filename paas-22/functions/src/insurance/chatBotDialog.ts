import * as functions from "firebase-functions"
// import * as dialogflow from "dialogflow"
const dialogflow=require("dialogflow")
import * as structjson from "./structjson"
import axios from "axios"

import { DIALOGFLOW, paymentServiceUrl } from "./insuranceConfig"
import { dialogAgent, publish } from "./dialogAgent"
import { DialogMessage } from "../dialogMessage"
import * as productService from "./productService"

const sessionClient = new dialogflow.SessionsClient({ keyFilename: DIALOGFLOW.path });

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
    let price
    switch (queryResult.action) {
        case "welcome":
            events.push("showProducts")
            events.push("ask4Buy")
            break
        case "buyProduct":
            price = productService.getPrice(parameters.product)
            dialogMessage.replyMessages[0].message = dialogMessage.replyMessages[0].message.replace('%{price}%', price)
            publish(dialogMessage)
            axios.post(paymentServiceUrl, {
                shopMessage: {
                    channel: dialogMessage.channel,
                    userId: dialogMessage.userId,
                    event: "ask4Pay",
                    product: {
                        name: parameters.product,
                        price: price
                    }
                }
            })
            break
        case "error":
            events.push("showProducts")
            events.push("ask4Buy")
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