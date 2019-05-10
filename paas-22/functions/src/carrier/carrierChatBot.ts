const {PubSub}=require("@google-cloud/pubsub")
import axios from "axios"
import { dialogAgent } from "./carrierDialogAgent"
import { pushMessage } from "./pushService"
import { DialogMessage, ReplyMessage, FollowChatModel, CarryChatModel, HandoverModel } from "./carrierModel"
import { shop, pubsubConfig, CarrySubName,APIGEE , mallFlowUrl ,mallServiceUrl} from "./carrierConfig"

const googlePubsub = new PubSub({ keyFilename: pubsubConfig.serviceAccountPath })
const carrySub = googlePubsub.subscription(pubsubConfig.subPath + CarrySubName)

export const messageDispatcher = (dialogMessage: DialogMessage|any): void => {
    let request
    if (dialogMessage.userMessage.type == "event") {
        let result_variable = {} as any
        result_variable.event = dialogMessage.userMessage.event
        request = {
            context: {
                skills: {
                    "main skill": {
                        user_defined: result_variable
                    }
                }
            }
        }
    }
    else {
        request = {
            input: {
                text: dialogMessage.userMessage.intent,
                options: {
                    return_context: true
                }
            }
        }
    }
    dialogAgent(request, dialogMessage).then(response => {
        if (response.output.actions)
            actionDispatcher(response, dialogMessage)
    })
}

export const actionDispatcher = async (response:any, dialogMessage: DialogMessage): Promise<void> => {
    const action = response.output.actions[0].name
    const parameters = response.output.actions[0].parameters
    let path:any
    let followChatModel
    let carryChatModel
    let result_variable = {} as any
    const headers = {
        "x-apikey": APIGEE.apikey
    }
    switch (action) {
        case "subscribe":
            followChatModel = {
                shopId: shop.id,
                channel: dialogMessage.channel,
                chatId: dialogMessage.chatId,
                customerPhone: parameters.phone
            } as FollowChatModel
            path = `flow/bindCustomer`
            //await axios.post(mallFlowUrl + path, { followChatModel }).then(result => {
            await axios.post(mallFlowUrl + path, { followChatModel },{headers}).then(result => {
                const followChatModel = result.data.followChatModel as FollowChatModel
                result_variable.result = followChatModel
            }).catch(error => {
                errorHandle(dialogMessage, error.response , path)
            })
            break
        case "unsubscribe":
            followChatModel = {
                shopId: shop.id,
                channel: dialogMessage.channel,
                chatId: dialogMessage.chatId
            } as FollowChatModel
            path = `flow/unbindCustomer`
            //axios.post(mallFlowUrl + path, { followChatModel }).then(result => {
            await axios.post(mallFlowUrl + path, { followChatModel },{headers}).then(result => {
            }).catch(error => {
                errorHandle(dialogMessage, error.response , path)
            })
            break
        case "carry":
            carryChatModel = {
                transactionId: parameters.transactionId,
                shopId: shop.id,
                chatId: dialogMessage.chatId,
                place: parameters.place
            } as CarryChatModel
            path = `flow/carry`
            //await axios.post(mallFlowUrl + path, { carryChatModel }).then(result => {
            await axios.post(mallFlowUrl + path, { carryChatModel },{headers}).then(result => {
                const carryChatModel = result.data.carryChatModel
                result_variable.result = carryChatModel
            }).catch(error => {
                errorHandle(dialogMessage, error.response , path)
            })
            break
        default:
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
        dialogAgent(request, dialogMessage).then(response => {
            if (response.output.actions)
                actionDispatcher(response, dialogMessage)
        })
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
                switch (path){
                    case "flow/bindCustomer":
                        errorMessageToCustomer = "系統錯誤\n非常抱歉，本店目前無法提供[新增顧客服務]，請與客服人員取得進一步訊息。"
                        break
                    case "flow/carry":
                        errorMessageToCustomer = "系統錯誤\n非常抱歉，本店目前無法提供[配送服務]，請與客服人員取得進一步訊息。"
                        break
                }
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

carrySub.on('message', async (message:any) => {
    const handoverModel = JSON.parse(Buffer.from(message.data, "base64").toString()) as HandoverModel
    let result_variable = {} as any
    if (handoverModel.toShopId == shop.id) {
        const customer = await axios.get(mallServiceUrl + `/service/carrier/customers?key=memberId&value=${handoverModel.customerId}`).then(result => {
            return result.data.customers[0]
        })
        const dialogMessage: DialogMessage = {
            channel: "WeChat",
            chatId: customer.weChatId,
            timestamp: new Date().getTime()
        }
        result_variable.transactionId = handoverModel.transactionId
        result_variable.fromShopId = handoverModel.fromShopId
        result_variable.productName = handoverModel.key
        result_variable.productPrice = handoverModel.value
        result_variable.event = handoverModel.event

        const request = {
            context: {
                skills: {
                    "main skill": {
                        user_defined: result_variable
                    }
                }
            }
        }
        dialogAgent(request, dialogMessage).then(response => {
            console.log(response);
            if (response.output.actions)
                actionDispatcher(response, dialogMessage)
        })
    }
    message.ack()
})