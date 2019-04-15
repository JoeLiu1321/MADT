import * as functions from 'firebase-functions'
import { WebhookEvent, validateSignature } from "@line/bot-sdk"

import * as chatBotDialog from "./chatBotDialog"
import * as dialogAgent from "./dialogAgent"

import { shop } from "./insuranceConfig"
import { DialogMessage } from "../dialogMessage"

export const lineWebhook = functions.https.onRequest((req, res) => {
    const signature = req.headers["x-line-signature"] as string
    if (validateSignature(JSON.stringify(req.body), shop.line.channelSecret, signature)) {
        const events = req.body.events as Array<WebhookEvent>
        for (const event of events)
            eventDispatcher(event)
        res.sendStatus(200)
    } else {
        res.status(403)
    }
})

const eventDispatcher = (event: WebhookEvent): void => {
    let userId:any
    if (event.source.type == "user") {
        userId = event.source.userId
    }
    else if (event.source.type == "group") {
        userId = event.source.groupId
    }
    console.log(userId)
    switch (event.type) {
        case "follow":
            follow(userId)
            break
        case "unfollow":
            break
        case "join":
            join(userId)
            break
        case "message":
            if (event.message.type == "text") {
                const dialogMessage = {
                    channel: "Line",
                    userId: userId,
                    userMessage: {
                        type: "text",
                        intent: event.message.text
                    },
                    replyMessages:{}
                } as DialogMessage
                chatBotDialog.messageDispatcher(dialogMessage)
            }
            break
    }
}

const follow = (userId: string) => {
    const message = `感謝你關注《${shop.name}》\n你的LineId如下:\n${userId}`
    const dialogMessage = {
        channel: "Line",
        userId: userId,
        replyMessages: [{
            type: "text",
            message: message
        }]
    } as DialogMessage
    dialogAgent.publish(dialogMessage)
}

const join = (userId: string) => {
    const message = `感謝你把《${shop.name}》加入群組\n你的GroupId如下:\n${userId}`
    const dialogMessage = {
        channel: "Line",
        userId: userId,
        replyMessages: [{
            type: "text",
            message: message
        }]
    } as DialogMessage
    dialogAgent.publish(dialogMessage)
}