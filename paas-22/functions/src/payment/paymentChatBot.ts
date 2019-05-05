const {PubSub}=require("@google-cloud/pubsub")
import axios from "axios"
import { dialogAgent } from "./paymentDialogAgent"
import { pushMessage } from "./pushService"
import { DialogMessage, ReplyMessage, FollowChatModel, BankingChatModel, HandoverModel } from "./paymentModel"
import { shop, mallFlowUrl, handoverUrl, carrierShopId, pubsubConfig, paymentSubName } from "./paymentConfig"

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
    let result_variable = {} as any
    switch (action) {
        case "follow":
            followChatModel = {
                shopId: shop.shopId,
                channel: dialogMessage.channel,
                chatId: dialogMessage.chatId,
                customerPhone: parameters.phone
            } as FollowChatModel
            await axios.post(mallFlowUrl + `flow/bindCustomer`, { followChatModel }).then(result => {
                const followChatModel = result.data.followChatModel as FollowChatModel
                result_variable.result = followChatModel
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
                shopId: shop.shopId,
                channel: dialogMessage.channel,
                chatId: dialogMessage.chatId
            } as FollowChatModel
            axios.post(mallFlowUrl + `flow/unbindCustomer`, { followChatModel })
            break
        case "pay":
            console.log(parameters.productPrice)
            bankingChatModel = {
                transactionId: parameters.transactionId,
                shopId: parameters.shopId,
                chatId: dialogMessage.chatId,
                action: "pay",
                amount: parameters.productPrice
            } as BankingChatModel
            await axios.post(mallFlowUrl + `flow/banking`, { bankingChatModel }).then(result => {
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
                axios.post(handoverUrl + `pubsub/shopHandover`, { handoverModel })
            })
            break
        case "deposit":
            bankingChatModel = {
                shopId: shop.shopId,
                chatId: dialogMessage.chatId,
                action: "deposit",
                amount: parameters.amount
            } as BankingChatModel
            await axios.post(mallFlowUrl + `flow/banking`, { bankingChatModel }).then(result => {
                const bankingChatModel = result.data.bankingChatModel
                result_variable.result = bankingChatModel
            })
            break
        default:
            break
    }

    if (result_variable) {
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

paymentSub.on("message", async (message:any) => {
    const handoverModel = JSON.parse(Buffer.from(message.data, "base64").toString()) as HandoverModel
    let result_variable = {} as any
    if (handoverModel.toShopId == shop.shopId) {
        const chatId = await axios.post(mallFlowUrl + "flow/getChatId", { shopId: shop.shopId, channel: "Line", customerId: handoverModel.customerId }).then(result => {
            return result.data.chatId
        })
        const dialogMessage: DialogMessage = {
            channel: "Line",
            chatId: chatId,
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
