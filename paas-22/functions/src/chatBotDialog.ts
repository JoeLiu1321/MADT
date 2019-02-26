import * as insuranceService from "./insuranceService"
import * as reportService from "./reportService"
import * as pushService from "./pushService"
import { DialogMessage } from "./appsModel"

export const messageDispatcher = (dialogMessage: DialogMessage): void => {
    switch (dialogMessage.userIntent) {
        case "保險商品":
            dialogMessage.replyMessage = insuranceService.getProducts()
            break
        case "保險商品型錄":
            dialogMessage.replyMessage = insuranceService.getProductCatalogue()
            break;
        case "幸福一生型錄":
            dialogMessage.replyMessage = insuranceService.getProductDM()
            break
        case "幸福一生價格":
            dialogMessage.replyMessage = insuranceService.getProductPrice()
            break
        case "幸福一生購買":
            dialogMessage.replyMessage = insuranceService.buyProduct()
            break
        case "交易明細":
            dialogMessage.replyMessage = reportService.customerOrders()
            break
        case "營運報表":
            dialogMessage.replyMessage = reportService.shopOperation()
            break
        default:
            dialogMessage.replyMessage = `語意錯誤：指令不存在`
            break
    }
    pushService.pushMessage(dialogMessage)
}
