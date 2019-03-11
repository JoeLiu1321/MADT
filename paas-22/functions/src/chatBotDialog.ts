const dialogflow=require("dialogflow")
import * as structjson from "./structjson"
import { DIALOGFLOW } from "./chatbotConfig"

import * as pushService from "./pushService"
import { DialogMessage } from "./appsModel"
import * as productService from "./productService";

const sessionClient = new dialogflow.SessionsClient({ keyFilename: DIALOGFLOW.path });

export const messageDispatcher = (dialogMessage: DialogMessage|any) => {
    const sessionId = dialogMessage.userId
    const sessionPath = sessionClient.sessionPath(DIALOGFLOW.projectId, sessionId)
    const queryInput = {
        text: {
            text: dialogMessage.userMessage.intent,
            languageCode: DIALOGFLOW.languageCode
        }
    }

    const request = {
        session: sessionPath,
        queryInput: queryInput
    }

    dialogflowAgent(request, dialogMessage)
}

const actionDispatcher = async (queryResult:any, dialogMessage: DialogMessage|any) => {
    const parameters = structjson.structProtoToJson(queryResult.parameters) as any
    let events = []
    switch (queryResult.action) {
        case "welcome":
            events.push("showProducts")
            events.push("ask4Buy")
            break
        case "buyProduct":
            const price = productService.getPrice(parameters.product)
            dialogMessage.replyMessage[0].message = dialogMessage.replyMessage[0].message.replace('%{price}%', price)
            pushService.pushMessage(dialogMessage)
            break
        case "error":
            events.push("showProducts")
            events.push("ask4Buy")
            break
    }

    if (events.length) {
        const sessionId = dialogMessage.userId
        const sessionPath = sessionClient.sessionPath(DIALOGFLOW.projectId, sessionId)
        for (const event of events) {
            const queryInput = {
                event: {
                    name: event,
                    languageCode: DIALOGFLOW.languageCode
                }
            }

            const request = {
                session: sessionPath,
                queryInput: queryInput
            }
            console.log(event)
            await dialogflowAgent(request, dialogMessage)
        }
    }
}

const dialogflowAgent = (request:any, dialogMessage: DialogMessage) => {
    return sessionClient.detectIntent(request).then(
        async (responses:any) => {
        const result = responses[0].queryResult
        const fulfillmentMessages = result.fulfillmentMessages
        let replyMessages = []
        let hasDynamicMessage = false
        for (const fulfillmentMessage of fulfillmentMessages) {
            let message = fulfillmentMessage.text.text[0].replace(/\\n/g, '\n')
            if (message) {
                if (message.includes("%"))
                    hasDynamicMessage = true
                replyMessages.push({ type: "text", message: message })
            }
        }

        dialogMessage.replyMessage = replyMessages
        if (!hasDynamicMessage)
            pushService.pushMessage(dialogMessage)
        if (result.action)
            actionDispatcher(result, dialogMessage)
        return result
    }).catch((err:any) => console.log(err));
}