const {PubSub}=require("@google-cloud/pubsub")
import * as dialogflow from 'dialogflow'
import * as structjson from './structjson'
import axios from 'axios'
import { dialogAgent } from "./insuranceDialogAgent"
import { pushMessage } from "./pushService"
import { DIALOGFLOW, shop, mallFlowUrl, handoverUrl , paymentShopId, pubsubConfig, insuranceSubName } from './insuranceConfig'
import { DialogMessage, ReplyMessage, FollowChatModel, BuyChatModel, HandoverModel } from './insuranceModel'

const sessionClient = new dialogflow.SessionsClient({ keyFilename: DIALOGFLOW.path })

const googlePubsub = new PubSub({ keyFilename: pubsubConfig.serviceAccountPath })
const insuranceSub = googlePubsub.subscription(pubsubConfig.subPath + insuranceSubName)


export const messageDispatcher = (dialogMessage: DialogMessage|any): void => {
    const sessionId = dialogMessage.chatId
    const sessionPath = sessionClient.sessionPath(DIALOGFLOW.projectId, sessionId)
    let queryInput
    if (dialogMessage.userMessage.type == "event") {
        queryInput = {
            event: {
                name: dialogMessage.userMessage.event,
                languageCode: DIALOGFLOW.languageCode
            }
        }
    }
    else {
        queryInput = {
            text: {
                text: dialogMessage.userMessage.intent,
                languageCode: DIALOGFLOW.languageCode
            }
        }
    }

    const request = {
        session: sessionPath,
        queryInput: queryInput
    }

    dialogAgent(request, dialogMessage).then(result => {
        if (result.action)
            actionDispatcher(result, dialogMessage)
    })
}

export const actionDispatcher = async (queryResult:any, dialogMessage: DialogMessage|any) => {
    const action = queryResult.action
    const parameters = structjson.structProtoToJson(queryResult.parameters) as any;
    let followChatModel
    switch (action) {
        case "follow":
            followChatModel = {
                shopId: shop.id,
                channel: dialogMessage.channel,
                chatId: dialogMessage.chatId,
                customerPhone: parameters.phone
            } as FollowChatModel
            await axios.post(mallFlowUrl + `flow/bindCustomer`, { followChatModel }).then(result => {
                const followChatModel = result.data.followChatModel as FollowChatModel
                dialogMessage.replyMessages[0].message = dialogMessage.replyMessages[0].message.replace("%{name}%", followChatModel.customerName).replace("%{phone}%", followChatModel.customerPhone)
                const replyMessage: ReplyMessage = {
                    channel: dialogMessage.channel,
                    chatId: dialogMessage.chatId,
                    replyMessages: dialogMessage.replyMessages
                }
                pushMessage(replyMessage)
            }).catch(error => {
                const replyMessage: ReplyMessage = {
                    channel: dialogMessage.channel,
                    chatId: dialogMessage.chatId,
                    replyMessages: [{ type: "text", message: error }]
                }
                pushMessage(replyMessage)
            })
            break
        case "unfollow":
            followChatModel = {
                shopId: shop.id,
                channel: dialogMessage.channel,
                chatId: dialogMessage.chatId
            } as FollowChatModel
            axios.post(mallFlowUrl + `flow/unbindCustomer`, { followChatModel })
            break
        case "buy":
            const buyChatModel: BuyChatModel = {
                shopId: shop.id,
                chatId: dialogMessage.chatId,
                productName: parameters.productName
            }
            await axios.post(mallFlowUrl + `flow/buy`, { buyChatModel }).then(result => {
                const buyChatModel:any = result.data.buyChatModel as BuyChatModel
                dialogMessage.replyMessages[0].message = dialogMessage.replyMessages[0].message.replace("%{productName}%", buyChatModel.productName).replace("%{productPrice}%", `${buyChatModel.productPrice}`)
                const replyMessage: ReplyMessage = {
                    channel: dialogMessage.channel,
                    chatId: dialogMessage.chatId,
                    replyMessages: dialogMessage.replyMessages
                }
                pushMessage(replyMessage)
                const handoverModel: HandoverModel = {
                    transactionId: buyChatModel.transactionId,
                    fromShopId: shop.id,
                    toShopId: paymentShopId,
                    event: "ask4Pay",
                    customerId: buyChatModel.customerId,
                    key: buyChatModel.productName,
                    value: buyChatModel.productPrice
                }
                axios.post(handoverUrl + `pubsub/shopHandover`, { handoverModel })
            })
            break
    }

}

insuranceSub.on("message", async (message:any) => {
    const handoverModel = JSON.parse(Buffer.from(message.data, "base64").toString()) as HandoverModel
    if (handoverModel.toShopId == shop.id) {
        const chatId = await axios.post(mallFlowUrl + "flow/getChatId", { shopId: shop.id, channel: "Line", customerId: handoverModel.customerId }).then(result => {
            return result.data.chatId
        })
        const dialogMessage: DialogMessage = {
            channel: "Line",
            chatId: chatId,
            timestamp: new Date().getTime()
        }
        const sessionId = dialogMessage.chatId
        const sessionPath = sessionClient.sessionPath(DIALOGFLOW.projectId, sessionId)
        const queryInput = {
            event: {
                name: handoverModel.event,
                languageCode: DIALOGFLOW.languageCode
            }
        }
        const request = {
            session: sessionPath,
            queryInput: queryInput
        }

        dialogAgent(request, dialogMessage).then(result => {
            if (result.action)
                actionDispatcher(result, dialogMessage)
        })
    }
    message.ack()
})