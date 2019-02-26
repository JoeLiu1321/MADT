import * as lineService from "./lineService"
import { DialogMessage } from "./appsModel"


export const pushMessage = (dialogMessage: DialogMessage) => {
    
    if (dialogMessage.channel == "Line") {
        const lineMessage = lineService.toTextMessage(dialogMessage.replyMessage)
        lineService.pushMessage(dialogMessage.userId, lineMessage)
    }
}