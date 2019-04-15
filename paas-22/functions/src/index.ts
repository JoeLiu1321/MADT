import * as functions from "firebase-functions"
import * as firebaseAdmin from "firebase-admin"
firebaseAdmin.initializeApp(functions.config().firebase)

import * as line from "./insurance/lineWebhook"
import * as shop from "./insurance/chatBotDialog"
import * as code_shop from "./code_shop/lineWebhook"

export const codeShop=code_shop.lineWebhook
export const shopLineWebhook = line.lineWebhook
export const handOverToShop = shop.handOverToShop

import * as paymentLine from "./payment/lineWebhook"
import * as payment from "./payment/chatBotDialog"

export const paymentLineWebhook = paymentLine.lineWebhook
export const handOverToPayment = payment.handOverToPayment

import * as dialogAgent from "./payment/dialogAgent"
export const sessionId = dialogAgent.sessionId

import * as linePush from "./push/line/lineSubscriber"
export const lineSubscriber = linePush.lineSubscriber

import * as weChatPush from "./push/weChat/weChatSubscriber"
export const weChatSubscriber = weChatPush.weChatSubscriber

