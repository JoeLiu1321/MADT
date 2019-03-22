import * as lineService from "./lineService"
import * as weChatService from "./weChatService"
import { DialogMessage } from "./appsModel"

export const pushMessage = async (dialogMessage: DialogMessage|any) => {
    if (!Array.isArray(dialogMessage.replyMessage)){
        dialogMessage.replyMessage=[dialogMessage.replyMessage]
    }
    for (const replyMessage of dialogMessage.replyMessage) {
        if (dialogMessage.channel == "Line") {
            let lineMessage:any
            switch (replyMessage.type) {
                case "text":
                    lineMessage = lineService.toTextMessage(replyMessage)
                    break
                case "carousel":
                    break
                default:
                    break
            }
            await lineService.pushMessage(dialogMessage.userId, lineMessage)
        }
        else if (dialogMessage.channel == "WeChat") {
            let weChatMessage
            switch (replyMessage.type) {
                case "text":
                    weChatMessage = weChatService.toTextMessage(dialogMessage ,replyMessage)
                    break
                case "carousel":
                    break
                case "image":
                    break
                case "voice":
                    break
                case "video":
                    break
                default:
                    break
            }
            await weChatService.pushMessage(weChatMessage)
        }
    }
}
