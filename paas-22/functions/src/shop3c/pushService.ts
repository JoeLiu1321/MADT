import * as lineService from "./lineService"
import { ReplyMessage } from "./shop3cModel"
import { shop } from "./shop3cConfig"

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
}