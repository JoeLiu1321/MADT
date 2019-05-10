const {PubSub}=require("@google-cloud/pubsub")
import * as dialogflow from 'dialogflow'
import * as structjson from './structjson'
import axios from 'axios'
import { dialogAgent } from "./insuranceDialogAgent"
import { pushMessage } from "./pushService"
import { DIALOGFLOW, shop, mallFlowUrl, paymentShopId, pubsubConfig, insuranceSubName ,APIGEE,mallServiceUrl} from './insuranceConfig'
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
    let path:any
    const headers = {
        "x-apikey": APIGEE.apikey
    }
    switch (action) {
        case "follow":
            followChatModel = {
                shopId: shop.shopId,
                channel: dialogMessage.channel,
                chatId: dialogMessage.chatId,
                customerPhone: parameters.phone
            } as FollowChatModel
            path = `flow/bindCustomer`
            // await axios.post(mallFlowUrl + path, { followChatModel }).then(result => {
            await axios.post(mallFlowUrl + path, { followChatModel },{headers}).then(result => {
                const followChatModel = result.data.followChatModel as FollowChatModel
                dialogMessage.replyMessages[0].message = dialogMessage.replyMessages[0].message.replace("%{name}%", followChatModel.customerName).replace("%{phone}%", followChatModel.customerPhone)
                const replyMessage: ReplyMessage = {
                    channel: dialogMessage.channel,
                    chatId: dialogMessage.chatId,
                    replyMessages: dialogMessage.replyMessages
                }
                pushMessage(replyMessage)
            }).catch(error => {
                errorHandle(dialogMessage, error.response , path)
            })
            break
        case "unfollow":
            followChatModel = {
                shopId: shop.shopId,
                channel: dialogMessage.channel,
                chatId: dialogMessage.chatId
            } as FollowChatModel
            path = `flow/unbindCustomer`
            //axios.post(mallFlowUrl + path, { followChatModel }).then(result => {
            axios.post(mallFlowUrl + path, { followChatModel },{headers}).then(result => {
            }).catch(error => {
                errorHandle(dialogMessage, error.response , path)
            })
            break
        case "buy":
            const buyChatModel: BuyChatModel = {
                shopId: shop.shopId,
                chatId: dialogMessage.chatId,
                productName: parameters.productName
            }
            path = `flow/buy`
            //await axios.post(mallFlowUrl + path, { buyChatModel }).then(result => {
            await axios.post(mallFlowUrl + path, { buyChatModel },{headers}).then(result => {
                const buyChatModel = result.data.buyChatModel as BuyChatModel
                dialogMessage.replyMessages[0].message = dialogMessage.replyMessages[0].message.replace("%{productName}%", buyChatModel.productName).replace("%{productPrice}%", `${buyChatModel.productPrice}`)
                const replyMessage: ReplyMessage = {
                    channel: dialogMessage.channel,
                    chatId: dialogMessage.chatId,
                    replyMessages: dialogMessage.replyMessages
                }
                pushMessage(replyMessage)
                const handoverModel: HandoverModel|any = {
                    transactionId: buyChatModel.transactionId,
                    fromShopId: shop.shopId,
                    toShopId: paymentShopId,
                    event: "ask4Pay",
                    customerId: buyChatModel.customerId,
                    key: buyChatModel.productName,
                    value: buyChatModel.productPrice
                }
                path = `pubsub/shopHandover`
                //axios.post(mallFlowUrl + path, { handoverModel }).catch(error => {
                axios.post(mallFlowUrl + path, { handoverModel },{headers}).catch(error => {
                    console.log(error.response)
                    errorHandle(dialogMessage, error.response , path)
                })
            }).catch(error => {
                errorHandle(dialogMessage, error.response , path)
            })
            break
    }

}

const errorHandle = (dialogMessage: DialogMessage, error: any, path: string) => {
    let errorMessageToCustomer
    const errorCode = error.data.fault.detail.errorcode as string
    switch (error.status) {
        case 401:
            errorMessageToCustomer = "系統錯誤\n非常抱歉，基於《授權》政策，本店目前無法提供此服務，請與客服人員取得進一步訊息。"
            break
        case 429:
            if (errorCode.includes("QuotaViolation")) {
                errorMessageToCustomer = "系統錯誤\n非常抱歉，本店目前無法提供[新增顧客服務]，請與客服人員取得進一步訊息。"
            }
            else {
                errorMessageToCustomer = "系統錯誤\n非常抱歉，受限於《流量管制》，本店目前無法同時提供大量顧客同時上線，敬請稍候再試。"
            }
            break
    }
    let replyMessages:any = [{ type: "text", message: errorMessageToCustomer }]
    const replyMessage: ReplyMessage = {
        channel: dialogMessage.channel,
        chatId: dialogMessage.chatId,
        replyMessages: replyMessages
    }
    pushMessage(replyMessage)
}

insuranceSub.on("message", async (message:any) => {
    const handoverModel = JSON.parse(Buffer.from(message.data, "base64").toString()) as HandoverModel
    if (handoverModel.toShopId == shop.shopId) {
        const customer = await axios.get(mallServiceUrl + `service/insurance/customers?key=memberId&value=${handoverModel.customerId}`).then(result => {
            return result.data.customers[0]
        })
        const dialogMessage: DialogMessage = {
            channel: "Line",
            chatId: customer.lineId,
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