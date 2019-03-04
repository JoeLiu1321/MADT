// const moduleName = "weChatWebhook"

import * as functions from 'firebase-functions'
// import * as wechat from 'wechat'
const wechat=require('wechat')
import { WECHAT } from "./chatbotConfig"
import * as chatBotDialog from "./chatBotDialog"
import * as pushService from "./pushService"

import { DialogMessage } from "./appsModel"


export const weChatWebhook = functions.https.onRequest(wechat(WECHAT, (req:any, res:any) => {
    if (req.method.toLowerCase == "get")
        res.status(200).send(req.query.echostr)
    else {
        const event = req.weixin

        console.log(JSON.stringify(event, null, 4));
        eventDispatcher(event)
        res.reply("")
    }

}));

const eventDispatcher = (event:any) => {
    if (event.MsgType == "event") {
        switch (event.Event) {
            case "subscribe":
                subscribe(event.FromUserName)
                break
            case "unsubscribe":
                break
        }
    }
    else {
        let dialogMessage = {
            channel: "WeChat",
            userId: event.FromUserName,
            userMessage: {
                type: event.MsgType
            },
            replyMessage: {}
        } as DialogMessage|any

        switch (event.MsgType) {
            case "text":
                dialogMessage.userMessage.intent = event.Content
                break
            case "image":
            case "voice":
            case "video":
                dialogMessage.userMessage.mediaId = event.MediaId
                break
            case "location":
                dialogMessage.userMessage.locationX = event.Location_X
                dialogMessage.userMessage.locationY = event.Location_Y
                break

        }
        chatBotDialog.messageDispatcher(dialogMessage)
    }
}

const subscribe = (userId: string) => {
    const message = `感謝你關注《智能商城》\n你的WeChatId如下:\n${userId}`
    const dialogMessage = {
        channel: "WeChat",
        userId: userId,
        replyMessage: {
            type: "text",
            message: message
        }
    } as DialogMessage
    pushService.pushMessage(dialogMessage)
}


