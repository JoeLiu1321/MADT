import * as lineService from "./lineService"
import * as weChatService from "./weChatService"
import { DialogMessage } from "./appsModel"


export const pushMessage = async (dialogMessages: DialogMessage | DialogMessage[]|any) => {
    if (!Array.isArray(dialogMessages)) {
        dialogMessages = [dialogMessages]
    }
    for (const dialogMessage of dialogMessages) {
        if (dialogMessage.channel == "Line") {
            let lineMessage
            switch (dialogMessage.replyMessage.type) {
                case "text":
                    lineMessage = lineService.toTextMessage(dialogMessage)
                    break
                case "carousel":
                    // lineMessage = lineService.toCarouselMessage(dialogMessage)
                    break
                default:
                    break
            }
            await lineService.pushMessage(dialogMessage.userId, lineMessage)
        }
        else if (dialogMessage.channel == "WeChat") {
            let weChatMessage
            switch (dialogMessage.replyMessage.type) {
                case "text":
                    weChatMessage = weChatService.toTextMessage(dialogMessage)
                    break
                case "carousel":
                    weChatMessage = weChatService.toTextMessages(dialogMessage)
                    break
                case "image":
                    weChatMessage = weChatService.toImageMessage(dialogMessage)
                    break
                case "voice":
                    weChatMessage = weChatService.toVoiceMessage(dialogMessage)
                    break
                case "video":
                    weChatMessage = weChatService.toVideoMessage(dialogMessage)
                    break
                default:
                    break
            }
            await weChatService.pushMessage(weChatMessage)
        }
    }
}
