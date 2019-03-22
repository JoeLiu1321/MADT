import * as functions from "firebase-functions"
// import * as dialogflow from "dialogflow"
const dialogflow=require("dialogflow")
import * as assistantV2 from "watson-developer-cloud/assistant/v2"
import { DIALOGFLOW , ASSISTANT, shopServiceUrl, sessionServiceUrl } from "./chatbotConfig"

import { DialogMessage } from "./appsModel"
import * as pushService from "./pushService"
import * as paymentService from "./paymentService"
import * as Cache from "node-cache"
import axios from "axios"

const cache = new Cache({ stdTTL: 300, checkperiod: 0 })

const assistant = new assistantV2({
    username: ASSISTANT.username,
    password: ASSISTANT.password,
    url: ASSISTANT.url,
    version: ASSISTANT.version
});

const sessionClient = new dialogflow.SessionsClient({ keyFilename: DIALOGFLOW.path });

export const messageDispatcher = (dialogMessage: DialogMessage|any) => {
    const request = {
        input: {
            text: dialogMessage.userMessage.intent,
            options: {
                return_context: true
            }
        }
    }
    dialogMessage.agent = "ibmAssistant"
    dialogAgent(request, dialogMessage)
}

const actionDispatcher = (response:any, dialogMessage: DialogMessage) => {
    let balance
    let minBalance
    let totalBalance
    let result_variable = {} as any
    switch (response.output.actions[0].name) {
        case "balance":
            balance = paymentService.getBalance()
            minBalance = paymentService.getMininumBalance()
            result_variable.result = {
                balance: balance,
                minBalance: minBalance
            }
            break
        case "deposit":
            balance = paymentService.getBalance()
            minBalance = paymentService.getMininumBalance()
            const amount = response.output.actions[0].parameters.amount
            totalBalance = balance + amount
            paymentService.updateBalance(totalBalance)
            result_variable.result = {
                balance: balance,
                minBalance: minBalance,
                amount: amount,
                totalBalance: totalBalance
            }
            break
        case "pay":
            balance = paymentService.getBalance()
            const price = response.output.actions[0].parameters.price
            totalBalance = balance - price
            paymentService.updateBalance(totalBalance)
            result_variable.result = {
                balance: balance,
                price: price,
                totalBalance: totalBalance
            }
            axios.post(sessionServiceUrl + "deleteSessionId", { userId: dialogMessage.userId })
            break
        case "handOver":
            const shop = response.output.actions[0].parameters.shop
            if (shop == "保險商店") {
                axios.post(shopServiceUrl + "handOverToShop", {
                    shopMessage: {
                        channel: dialogMessage.channel,
                        userId: dialogMessage.userId,
                        event: "welcome"
                    }
                })
            }
            break
    }
    if (Object.keys(result_variable).length > 0) {
        const request = {
            context: {
                skills: {
                    "main skill": {
                        user_defined: result_variable
                    }
                }
            }
        }
        dialogMessage.agent = "ibmAssistant"
        dialogAgent(request, dialogMessage)
    }
}

const dialogAgent = async (request:any, dialogMessage: DialogMessage|any) => {
    switch (dialogMessage.agent){
        case "dialogFlow":
            return sessionClient.detectIntent(request).then(async (responses:any) => {
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
            break
        case "ibmAssistant":
            const sessionId = await axios.post(sessionServiceUrl + "getSessionId", { userId: dialogMessage.userId }).then(result => {
                return result.data as string
            })
            assistant.message(
                {
                    input: request.input,
                    context: request.context,
                    assistant_id: ASSISTANT.assistantId,
                    session_id: sessionId
                }, async (err:any, response:any) => {
                    const messages = response.output.generic
                    let replyMessages = []
                    for (const message of messages) {
                        if (message) {
                            replyMessages.push({ type: "text", message: message.text })
                        }
                    }
                    dialogMessage.replyMessage = replyMessages
                    pushService.pushMessage(dialogMessage)
                    if (response.output.actions)
                        await actionDispatcher(response, dialogMessage)
                })
            break
    }
}

export const getSessionId = functions.https.onRequest((req, res) => {
    const userId = req.body.userId
    const sessionId = cache.get(userId)
    if (!sessionId) {
        assistant.createSession({ assistant_id: ASSISTANT.assistantId }, (err:any, result:any) => {
            cache.set(userId, result.session_id, 300)
            res.send(result.session_id)
        })
    }
    else {
        res.send(sessionId)
    }
})

export const deleteSessionId = functions.https.onRequest((req, res) => {
    const userId = req.body.userId
    const sessionId = cache.get(userId)
    if (sessionId) {
        cache.del(userId)
    }
    res.sendStatus(200)
})


export const handOverToPayment = functions.https.onRequest((req, res) => {
    const shopMessage = req.body.shopMessage
    let result_variable = {} as any
    const dialogMessage: DialogMessage = {
        channel: shopMessage.channel,
        userId: shopMessage.userId
    }
    result_variable.product = shopMessage.product
    result_variable.event = shopMessage.event

    const request = {
        context: {
            skills: {
                "main skill": {
                    user_defined: result_variable
                }
            }
        }
    }
    dialogMessage.agent = "ibmAssistant"
    dialogAgent(request, dialogMessage)
    res.sendStatus(200)
})

