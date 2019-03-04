import * as insuranceService from "./insuranceService"
import * as reportService from "./reportService"
import * as pushService from "./pushService"
import { DialogMessage } from "./appsModel"

export const messageDispatcher = (dialogMessage: DialogMessage|any) => {
    if (dialogMessage.userMessage.intent) {
        switch (dialogMessage.userMessage.intent) {
            case "保險商品":
                dialogMessage.replyMessage.message = insuranceService.getProducts()
                dialogMessage.replyMessage.type = "text"
                break
            case "保險商品型錄":
                dialogMessage.replyMessage.messages = insuranceService.getDMList()
                dialogMessage.replyMessage.type = "carousel"
                break
            case "幸福一生型錄":
                dialogMessage.replyMessage.message = insuranceService.getProductDM()
                dialogMessage.replyMessage.type = "text"
                break
            case "幸福一生價格":
                dialogMessage.replyMessage.message = insuranceService.getProductPrice()
                dialogMessage.replyMessage.type = "text"
                break
            case "幸福一生購買":
                dialogMessage.replyMessage.message = insuranceService.buyProduct()
                dialogMessage.replyMessage.type = "text"
                break
            case "幸福一生圖片":
                dialogMessage.replyMessage.mediaId = insuranceService.getProductImage()
                dialogMessage.replyMessage.type = "image"
                break
            case "幸福一生語音":
                dialogMessage.replyMessage.mediaId = insuranceService.getProductVoice()
                dialogMessage.replyMessage.type = "voice"
                break
            case "幸福一生視頻":
                dialogMessage.replyMessage.mediaId = insuranceService.getProductVideo()
                dialogMessage.replyMessage.type = "video"
                break
            case "保險商店":
                dialogMessage.replyMessage.message = insuranceService.getShopLocation()
                dialogMessage.replyMessage.type = "text"
                break
            case "消費明細":
                dialogMessage.replyMessage.message = reportService.customerOrders()
                dialogMessage.replyMessage.type = "text"
                break
            case "營運報表":
                dialogMessage.replyMessage.message = reportService.shopOperation()
                dialogMessage.replyMessage.type = "text"
                break
            default:
                return replyErrorMessages(dialogMessage)
                break
        }
        return pushService.pushMessage(dialogMessage)
    }
    else {
        return replyMediaMessages(dialogMessage)
    }
}

const replyMediaMessages = (dialogMessage: DialogMessage|any) => {
    let dialogMessages: DialogMessage[] = []
    const replyMessage = {
        type: "text",
        message: `謝謝你傳來的《${dialogMessage.userMessage.type == "image" ? "圖片" : dialogMessage.userMessage.type == "voice" ? "語音" : dialogMessage.userMessage.type == "video" ? "視頻" : dialogMessage.userMessage.type == "location" ? "位置" : ""}》訊息`
    }

    dialogMessages.push({ ...dialogMessage, replyMessage: replyMessage })

    let mediaMessage
    if (dialogMessage.userMessage.type == "location")
        mediaMessage = {
            type: "text",
            message: `${dialogMessage.userMessage.locationX},${dialogMessage.userMessage.locationY}`
        }
    else
        mediaMessage = {
            type: dialogMessage.userMessage.type,
            mediaId: dialogMessage.userMessage.mediaId
        }

    dialogMessages.push({ ...dialogMessage, replyMessage: mediaMessage })

    pushService.pushMessage(dialogMessages)
}

const replyErrorMessages = (dialogMessage: DialogMessage|any) => {
    let dialogMessages: DialogMessage[] = []
    const replyMessage = {
        type: "text",
        message: `謝謝你傳來的《文字》訊息`
    }

    dialogMessages.push({ ...dialogMessage, replyMessage: replyMessage })

    const intentMessage = {
        type: "text",
        message: dialogMessage.userMessage.intent
    }
    
    dialogMessages.push({ ...dialogMessage, replyMessage: intentMessage })

    pushService.pushMessage(dialogMessages)
}
