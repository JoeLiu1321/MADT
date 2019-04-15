const dialogflow=require("dialogflow")
const {PubSub}=require("@google-cloud/pubsub")
import * as functions from "firebase-functions"
import * as assistantV2 from "watson-developer-cloud/assistant/v2"
import * as Cache from "node-cache"
import axios from "axios"
import { shop, topicName, DIALOGFLOW, ASSISTANT, pubsubConfig, sessionServiceUrl } from "./paymentConfig"
import { DialogMessage } from "../dialogMessage"
import { ChannelMessage } from "./appsModel";

const cache = new Cache({ stdTTL: 300, checkperiod: 0 })

const sessionClient = new dialogflow.SessionsClient({ keyFilename: DIALOGFLOW.path });
const assistant = new assistantV2({
    username: ASSISTANT.username,
    password: ASSISTANT.password,
    url: ASSISTANT.url,
    version: ASSISTANT.version
})

const googlePubsub = new PubSub({ keyFilename: pubsubConfig.serviceAccountPath })

export const dialogAgent = async (request:any, dialogMessage: DialogMessage): Promise<any> => {
    switch (dialogMessage.agent) {
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

                dialogMessage.replyMessages = replyMessages
                if (!hasDynamicMessage)
                    await publish(dialogMessage)
                return result
            }).catch((err:any) => console.log(err));
            break
        case "ibmAssistant":
            const sessionId = await axios.post(sessionServiceUrl + "sessionId", { userId: dialogMessage.userId }).then(result => {
                return result.data as string
            })
            return new Promise((resolve, reject) => {
                assistant.message({
                    input: request.input,
                    context: request.context,
                    assistant_id: ASSISTANT.assistantId,
                    session_id: sessionId
                }, async (err, response:any) => {
                    const messages = response.output.generic
                    let replyMessages = []
                    for (const message of messages) {
                        if (message) {
                            replyMessages.push({ type: "text", message: message.text })
                        }
                    }
                    dialogMessage.replyMessages = replyMessages
                    await publish(dialogMessage)
                    resolve(response)
                })
            })
            break
    }
}

export const sessionId = functions.https.onRequest((req, res) => {
    switch (req.method) {
        case "POST":
            getSessionId(req,res)
            break
        case "GET":
            break
        case "PUT":
            break
        case "DELETE":
            deleteSessionId(req,res)
            break
        default:
            break
    }
})

const getSessionId = (req:any,res:any) => {
    const userId = req.body.userId
    const sessionId = cache.get(userId)
    if (!sessionId) {
        assistant.createSession({ assistant_id: ASSISTANT.assistantId }, (err, result:any) => {
            cache.set(userId, result.session_id, 300)
            res.send(result.session_id)
        })
    }
    else {
        res.send(sessionId)
    }
}

const deleteSessionId = (req:any,res:any) => {
    const userId = req.query.userId
    const sessionId = cache.get(userId)
    if (sessionId) {
        cache.del(userId)
    }
    res.sendStatus(200)
}

export const publish = async (dialogMessage: DialogMessage) => {
    if (dialogMessage.channel && dialogMessage.userId && dialogMessage.replyMessages ) {
        const channelMessage: ChannelMessage = {
            shopId: shop.shopId,
            channel: dialogMessage.channel,
            userId: dialogMessage.userId,
            replyMessage: dialogMessage.replyMessages
        }
        const dataBuffer = Buffer.from(JSON.stringify(channelMessage))
        const topic =await googlePubsub.topic(topicName)
        await topic.publish(dataBuffer).then((res:any) => {
            for(const msg of channelMessage.replyMessage)
                console.log("Pub Success : "+msg.message)
        }).catch((err:any) => {
            console.log(err)
        })
    } else {
        console.log("the parameter is incorrect")
    }
 }