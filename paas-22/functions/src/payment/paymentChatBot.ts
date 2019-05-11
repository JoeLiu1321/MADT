const {PubSub}=require("@google-cloud/pubsub")
import axios from "axios"
import { dialogAgent } from "./paymentDialogAgent"
import { pushMessage } from "./pushService"
import { DialogMessage, ReplyMessage, FollowChatModel, BankingChatModel, HandoverModel } from "./paymentModel"
import { shop, mallFlowUrl,carrierShopId, pubsubConfig, paymentSubName,APIGEE,mallServiceUrl } from "./paymentConfig"

const googlePubsub = new PubSub({ keyFilename: pubsubConfig.serviceAccountPath })
const paymentSub = googlePubsub.subscription(pubsubConfig.subPath + paymentSubName)

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
    let followChatModel
    let bankingChatModel
    let path:any
    let result_variable = {} as any
    const headers = {
        "x-apikey": APIGEE.apikey
    }
    console.log("action : "+action)
    switch (action) {
        case "follow":
            followChatModel = {
                shopId: shop.id,
                channel: dialogMessage.channel,
                chatId: dialogMessage.chatId,
                customerPhone: parameters.phone
            } as FollowChatModel
            path = 'flow/bindCustomer'
            await axios.post(mallFlowUrl + path, { followChatModel },{headers}).then(result => {
                const followChatModel = result.data.followChatModel as FollowChatModel
                result_variable.result = followChatModel
            }).catch(error => {
                errorHandle(dialogMessage, error.response, path)
            })
            break
        case "unfollow":
            followChatModel = {
                shopId: shop.id,
                channel: dialogMessage.channel,
                chatId: dialogMessage.chatId
            } as FollowChatModel
            path = `flow/unbindCustomer`
            await axios.post(mallFlowUrl + path, { followChatModel },{headers}).then(result => {
            }).catch(error => {
                errorHandle(dialogMessage, error.response, path)
            })
            break
        case "pay":
            console.log(parameters.productPrice)
            bankingChatModel = {
                transactionId: parameters.transactionId,
                shopId: shop.id,
                chatId: dialogMessage.chatId,
                action: "pay",
                amount: parameters.productPrice
            } as BankingChatModel
            path = `flow/banking`
            await axios.post(mallFlowUrl + path, { bankingChatModel },{headers}).then(result => {
                const bankingChatModel = result.data.bankingChatModel
                result_variable.result = bankingChatModel
                const handoverModel: HandoverModel = {
                    transactionId: bankingChatModel.transactionId,
                    fromShopId: shop.shopId,
                    toShopId: carrierShopId,
                    event: "ask4Carry",
                    customerId: bankingChatModel.customerId,
                    key: parameters.productName,
                    value: parameters.productPrice
                }
                path = `pubsub/shopHandover`
                axios.post(mallFlowUrl + path, { handoverModel },{headers}).catch(error => {
                    errorHandle(dialogMessage, error.response, path)
                })
            }).catch(error => {
                errorHandle(dialogMessage, error.response, path)
            })
            break
        case "deposit":
            bankingChatModel = {
                shopId: shop.id,
                chatId: dialogMessage.chatId,
                action: "deposit",
                amount: parameters.amount
            } as BankingChatModel
            path = `flow/banking`
            await axios.post(mallFlowUrl + path, { bankingChatModel },{headers}).then(result => {
                const bankingChatModel = result.data.bankingChatModel
                result_variable.result = bankingChatModel
            }).catch(error => {
                errorHandle(dialogMessage, error.response, path)
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
            console.log(response)
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
                    case "flow/banking":
                        errorMessageToCustomer = "系統錯誤\n非常抱歉，本店目前無法提供[支付服務]，請與客服人員取得進一步訊息。"
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

paymentSub.on("message", async (message:any) => {
    const handoverModel = JSON.parse(Buffer.from(message.data, "base64").toString()) as HandoverModel
    let result_variable = {} as any
    if (handoverModel.toShopId == shop.shopId) {
        const customer = await axios.get(mallServiceUrl + `service/payment/customers?key=memberId&value=${handoverModel.customerId}`).then(result => {
            return result.data.customers[0]
        })
        const dialogMessage: DialogMessage = {
            channel: "Line",
            chatId: customer.lineId,
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