import * as functions from "firebase-functions"
import * as firebaseAdmin from "firebase-admin"
firebaseAdmin.initializeApp(functions.config().firebase)

import * as Insurance from "./insurance/insuranceLineWebhook"
import * as Payment from "./payment/paymentLineWebhook"
// import * as Carrier from "./carrier/carrierWeChatWebhook"

import * as mallFlow from "./flow/mallFlow"
import * as handOver from "./handover/handover"

import * as mallService from "./mallService/mallService"
import * as insuranceService from "./mallService/insuranceService"
import * as paymentService from "./mallService/paymentService"
// import * as carrierService from "./mallService/carrierService"

import * as paymentSession from "./payment/paymentDialogAgent"
// import * as carrierSession from "./carrier/carrierDialogAgent"

export const insuranceLineWebhook = Insurance.lineWebhook
export const paymentLineWebhook = Payment.lineWebhook
// export const carrierWeChatWebhook = Carrier.weChatWebhook

const bindCustomer = mallFlow.bindCustomer
const unbindCustomer = mallFlow.unbindCustomer
const shopHandover = handOver.shopHandover
const buy = mallFlow.buy
const banking = mallFlow.banking
// const carry = mallFlow.carry
const getChatId = mallFlow.getChatId

const members = mallService.members
const records = mallService.records
const insuranceCustomer = insuranceService.customers
const product = insuranceService.products
const paymentCustomer = paymentService.customers
// const carrierCustomer = carrierService.customers

const paymentSessionId = paymentSession.sessionId
// const carrierSessionId = carrierSession.sessionId

const express = require('express');

const service = express();
const pubsub = express();
const payment = express();
// const carrier = express();
const flow = express();

payment.all("/sessionId", paymentSessionId)
// carrier.all("/sessionId", carrierSessionId)

service.all("/insurance/customers", insuranceCustomer)
service.all("/insurance/products", product)
service.all("/payment/customers", paymentCustomer)
// service.all("/carrier/customers", carrierCustomer)
service.all("/mall/members", members)
service.all("/mall/records", records)

flow.all("/bindCustomer",bindCustomer)
flow.all("/unbindCustomer",unbindCustomer)
flow.all("/buy",buy)
flow.all("/banking",banking)
// flow.all("/carry",carry)
flow.all("/getChatId",getChatId)

pubsub.all("/shopHandover",shopHandover)


exports.payment =functions.https.onRequest(payment)
// exports.carrier = functions.https.onRequest(carrier)
exports.service = functions.https.onRequest(service)
exports.flow = functions.https.onRequest(flow)
exports.pubsub = functions.https.onRequest(pubsub)