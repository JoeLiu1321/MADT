import * as dialogflow from "dialogflow"
import { pushMessage } from "./pushService"
import { DIALOGFLOW } from "./insuranceConfig"
import { DialogMessage, ReplyMessage } from "./insuranceModel"

const sessionClient = new dialogflow.SessionsClient({ keyFilename: DIALOGFLOW.path });

export const dialogAgent = async (request:any, dialogMessage: DialogMessage): Promise<any> => {
    return sessionClient.detectIntent(request).then(async responses => {
        const result = responses[0].queryResult
        const fulfillmentMessages:any = result.fulfillmentMessages
        let replyMessages = []
        let isDynamicMessage = false
        for (const fulfillmentMessage of fulfillmentMessages) {
            let message = fulfillmentMessage.text.text[0].replace(/\\n/g, '\n')
            if (message) {
                if (message.includes("%"))
                    isDynamicMessage = true
                replyMessages.push({ type: "text", message: message })
            }
        }

        dialogMessage.replyMessages = replyMessages
        if (!isDynamicMessage) {
            const replyMessage = {
                channel: dialogMessage.channel,
                chatId: dialogMessage.chatId,
                replyMessages: dialogMessage.replyMessages
            } as ReplyMessage
            pushMessage(replyMessage)
        }
        return result
    }).catch(err => console.log(err));

}