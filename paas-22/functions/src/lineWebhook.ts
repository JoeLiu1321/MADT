// const moduleName = "lineWebhook"

import * as functions from 'firebase-functions'
import { WebhookEvent, validateSignature } from "@line/bot-sdk"

import { LINE } from "./chatbotConfig"
import * as chatBotDialog from "./chatBotDialog"
import * as pushService from "./pushService"

import { DialogMessage } from "./appsModel"

export const lineWebhook = functions.https.onRequest((req, res) => {
    const signature = req.headers["x-line-signature"] as string
    if (validateSignature(JSON.stringify(req.body), LINE.channelSecret, signature)) {
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
                const userIntent = event.message.text
                const dialogMessage = {
                    channel: "Line",
                    userId: userId,
                    userIntent: userIntent,
                } as DialogMessage
                chatBotDialog.messageDispatcher(dialogMessage)
            }
            break
    }
}

const follow = (userId: string) => {
    const message = `感謝你關注《智能商城》\n你的LineId如下:\n${userId}`
    const dialogMessage = {
        channel: "Line",
        userId: userId,
        userIntent: "follow",
        replyMessage: message
    } as DialogMessage|any
    pushService.pushMessage(dialogMessage)
}

const join = (userId: string) => {
    const message = `感謝你把《智能商城》加入群組\n你的GroupId如下:\n${userId}`
    const dialogMessage = {
        channel: "Line",
        userId: userId,
        userIntent: "join",
        replyMessage: message
    } as DialogMessage|any
    pushService.pushMessage(dialogMessage)
}