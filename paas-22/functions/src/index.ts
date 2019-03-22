import * as functions from "firebase-functions"
import * as firebaseAdmin from "firebase-admin"
firebaseAdmin.initializeApp(functions.config().firebase)

import * as line from "./lineWebhook"
import * as weChat from "./weChatWebhook"
import * as shop from "./chatBotDialog"


export const shopLineWebhook = line.lineWebhook
export const weChatWebhook = weChat.weChatWebhook
export const handOverToShop = shop.handOverToShop

import * as paymentLine from "./payment/lineWebhook"
import * as paymentweChat from "./payment/weChatWebhook"
import * as payment from "./payment/chatBotDialog"

export const paymentLineWebhook = paymentLine.lineWebhook
export const paymentWeChatWebhook = paymentweChat.weChatWebhook
export const handOverToPayment = payment.handOverToPayment
export const getSessionId = payment.getSessionId
export const deleteSessionId = payment.deleteSessionId