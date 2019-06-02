import * as functions from "firebase-functions"
import * as assistantV2 from "watson-developer-cloud/assistant/v2"
import * as Cache from "node-cache"
import axios from "axios"
import { pushMessage } from "./pushService"
import { ASSISTANT, sessionServiceUrl } from "./shop3cConfig"
import { DialogMessage, ReplyMessage } from "./shop3cModel"

const cache = new Cache({ stdTTL: 300, checkperiod: 0 })

const assistant = new assistantV2({
    username: ASSISTANT.username,
    password: ASSISTANT.password,
    url: ASSISTANT.url,
    version: ASSISTANT.version
})

export const dialogAgent = async (request:any, dialogMessage: DialogMessage): Promise<any> => {
    const sessionId = await axios.post(sessionServiceUrl + `sessionId`, { chatId: dialogMessage.chatId }).then(result => {
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
                    const msg = message.text.replace(/\\n/g, '\n')
                    replyMessages.push({ type: "text", message: msg })
                }
            }
            const replyMessage: ReplyMessage = {
                channel: "Line",
                chatId: dialogMessage.chatId,
                replyMessages: replyMessages
            }
            if (replyMessages.length > 0)
                pushMessage(replyMessage)
            resolve(response)
        })
    })
}

export const sessionId = functions.https.onRequest((req, res) => {
    switch (req.method) {
        case "POST":
            getSessionId(req, res)
            break
        case "GET":
            break
        case "PUT":
            break
        case "DELETE":
            deleteSessionId(req, res)
            break
        default:
            break
    }
})

const getSessionId = (req:any, res:any) => {
    const chatId = req.body.chatId
    const sessionId = cache.get(chatId)
    if (!sessionId) {
        assistant.createSession({ assistant_id: ASSISTANT.assistantId }, (err, result:any) => {
            cache.set(chatId, result.session_id, 300)
            res.send(result.session_id)
        })
    }
    else {
        res.send(sessionId)
    }
}

const deleteSessionId = (req:any, res:any) => {
    const chatId = req.query.chatId
    cache.del(chatId)
    res.sendStatus(200)
}