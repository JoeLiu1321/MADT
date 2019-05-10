import * as functions from "firebase-functions"
import * as assistantV2 from "watson-developer-cloud/assistant/v2"
import * as Cache from "node-cache"
import axios from "axios"
import { pushMessage } from "./pushService"
import { ASSISTANT, sessionServiceUrl } from "./carrierConfig"
import { DialogMessage ,ReplyMessage } from "./carrierModel"

const cache = new Cache({ stdTTL: 300, checkperiod: 0 })

const assistant = new assistantV2({
    username: ASSISTANT.username,
    password: ASSISTANT.password,
    url: ASSISTANT.url,
    version: ASSISTANT.version
})

export const dialogAgent = async (request:any, dialogMessage: DialogMessage): Promise<any> => {
    const sessionId = await axios.post(sessionServiceUrl + `carrier/sessionId`, { userId: dialogMessage.chatId }).then(result => {
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
            const replyMessage : ReplyMessage= {
                channel: "WeChat",
                chatId: dialogMessage.chatId,
                replyMessages: replyMessages
            }
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
}

const deleteSessionId = (req:any, res:any) => {
    const userId = req.query.userId
    cache.del(userId)
    res.sendStatus(200)
}