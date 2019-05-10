// const moduleName = "weChatWebhook"

import * as functions from 'firebase-functions'
// import * as wechat from 'wechat'
const wechat=require('wechat')
import { shop } from "./carrierConfig"
import * as chatBotDialog from "./carrierChatBot"
import { DialogMessage } from "./carrierModel"


export const weChatWebhook = functions.https.onRequest(wechat(shop.weChat, (req:any, res:any) => {
    if (req.method.toLowerCase == "get")
        res.status(200).send(req.query.echostr)
    else {
        const event = req.weixin

        console.log(JSON.stringify(event, null, 4));
        eventDispatcher(event)
        res.reply("")
    }

}));

const eventDispatcher = (event:any): void => {
    let dialogMessage
    if (event.MsgType == "event") {
        switch (event.Event) {
            case "subscribe":
                dialogMessage = {
                    channel: "WeChat",
                    chatId: event.FromUserName,
                    userMessage: {
                        type: "event",
                        event: "subscribe"
                    },
                    timestamp: event.CreateTime
                } as DialogMessage
                chatBotDialog.messageDispatcher(dialogMessage)
                break
            case "unsubscribe":
                dialogMessage = {
                    channel: "WeChat",
                    chatId: event.FromUserName,
                    userMessage: {
                        type: "event",
                        event: "unsubscribe"
                    },
                    timestamp: event.CreateTime
                } as DialogMessage
                chatBotDialog.messageDispatcher(dialogMessage)
                break
        }
    }
    else {
        let dialogMessage:any = {
            channel: "WeChat",
            chatId: event.FromUserName,
            userMessage: {
                type: event.MsgType
            },
            replyMessage: {},
            timestamp: event.CreateTime
        } as DialogMessage

        switch (event.MsgType) {
            case "text":
                dialogMessage.userMessage.intent = event.Content
                break

        }
        chatBotDialog.messageDispatcher(dialogMessage)
    }
}