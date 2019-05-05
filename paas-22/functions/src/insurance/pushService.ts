import * as lineService from "./lineService"
import * as weChatService from "./weChatService"
import { ReplyMessage } from "./insuranceModel"
import { shop } from "./insuranceConfig"

export const pushMessage = (replyMessage: ReplyMessage) => {
    if (replyMessage.channel == "Line") {
        let lineMessages = []
        for (const message of replyMessage.replyMessages) {
            switch (message.type) {
                case "text":
                    lineMessages.push(lineService.toTextMessage(message))
                    break
            }
        }
        lineService.pushMessage(shop, replyMessage.chatId, lineMessages)
    }
    else if (replyMessage.channel == "WeChat") {
        let weChatMessages = []
        for (const message of replyMessage.replyMessages) {
            switch (message.type) {
                case "text":
                    weChatMessages.push(weChatService.toTextMessage(replyMessage.chatId, message))
                    break
            }
        }
        weChatService.pushMessage(shop, weChatMessages)
    }
}