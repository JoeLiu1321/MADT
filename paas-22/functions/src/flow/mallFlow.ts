import * as functions from 'firebase-functions'
import * as cors from 'cors'
import { mallServiceUrl } from "./mallFlowConfig"
import axios from "axios"
import * as uuid from "uuid/v1"

import { FollowChatModel, BuyChatModel, BankingChatModel, CarryChatModel } from './mallFlowModel';
import { Member, Customer, Product, Record } from './mallFlowModel';

const corsHandler = cors({ origin: true });

export const bindCustomer = functions.https.onRequest(async (req:any, res:any) => {
    corsHandler(req, res, async () => {
        let followChatModel = req.body.followChatModel as FollowChatModel
        const member: Member|any = await axios.get(mallServiceUrl + `service/mall/members?key=phone&value=${followChatModel.customerPhone}`).then(result => {
            return result.data.members[0] as Member
        })
        if (member) {
            let path=followChatModel.shopId
            switch (followChatModel.shopId) {
                case "11":
                    path = "insurance"
                    break
                case "12":
                    path = "payment"
                    break
                case "13":
                    path = "carrier"
                    break

            }
            let customer: Customer|any = await axios.get(mallServiceUrl + `service/${path}/customers?key=memberId&value=${member.memberId}`).then(result => {
                return result.data.customers[0] as Customer
            })

            let chatIdKey:any
            switch (followChatModel.channel) {
                case "Line":
                    chatIdKey = "lineId"
                    break
                case "WeChat":
                    chatIdKey = "weChatId"
                    break
            }
            if (customer) {
                customer[chatIdKey] = followChatModel.chatId
                axios.put(mallServiceUrl + `service/${path}/customers`, { customer })
            }
            else {
                customer = {
                    memberId: member.memberId
                }
                customer[chatIdKey] = followChatModel.chatId
                switch (followChatModel.shopId) {
                    case "11":
                        break
                    case "12":
                        customer.account = { balance: 100000 }
                        break
                    case "13":
                        customer.address = {
                            home: "台北市大安區愛國東路三段2號",
                            office: "台北市大安區忠孝東路三段1號"
                        }
                        break
                }
                axios.post(mallServiceUrl + `service/${path}/customers`, { customer })
            }

            const time = new Date().getTime()
            const record: Record = {
                shopId: followChatModel.shopId,
                customerId: customer.memberId,
                action: "follow",
                value: time
            }
            axios.post(mallServiceUrl + `service/mall/records`, { record })

            followChatModel.customerName = member.name
            res.status(200).send({ followChatModel })
        }
        else {
            res.status(400).send("綁定錯誤：成員不存在")
        }
    })
})

export const unbindCustomer = functions.https.onRequest(async (req, res) => {
    const followChatModel = req.body.followChatModel as FollowChatModel
    let path=followChatModel.shopId
    switch (followChatModel.shopId) {
        case "11":
            path = "insurance"
            break
        case "12":
            path = "payment"
            break
        case "13":
            path = "carrier"
            break
    }
    const customer: Customer = await axios.get(mallServiceUrl + `service/${path}/customers?key=${followChatModel.channel == "Line" ? "lineId" : "weChatId"}&value=${followChatModel.chatId}`).then(result => {
        return result.data.customers[0] as Customer
    })
    axios.delete(mallServiceUrl + `service/${path}/customers?memberId=${customer.memberId}`)

    const time = new Date().getTime()
    const record: Record = {
        shopId: followChatModel.shopId,
        customerId: customer.memberId,
        action: "unfollow",
        value: time
    }
    axios.post(mallServiceUrl + `service/mall/records`, { record })
})

export const buy = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        const buyChatModel = req.body.buyChatModel as BuyChatModel
        let customer: Customer = await axios.get(mallServiceUrl + `service/insurance/customers?key=lineId&value=${buyChatModel.chatId}`).then(result => {
            return result.data.customers[0] as Customer
        })
        if (customer) {
            const product: Product = await axios.get(mallServiceUrl + "service/insurance/products?key=name&value=" + encodeURI(buyChatModel.productName)).then(result => {
                return result.data.products[0] as Product
            })

            const time = new Date().getTime();
            const transcationId = uuid()
            const record: Record = {
                transactionId: transcationId,
                shopId: buyChatModel.shopId,
                customerId: customer.memberId,
                action: "buy",
                value: time
            }
            axios.post(mallServiceUrl + `service/mall/records`, { record })

            buyChatModel.transactionId = transcationId
            buyChatModel.customerId = customer.memberId
            buyChatModel.productPrice = product.price

            res.send({ buyChatModel })
        } else {
            res.status(400).send("採購錯誤：顧客不存在")
        }
    })
})

export const banking = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        const bankingChatModel:any = req.body.bankingChatModel as BankingChatModel
        let customer: Customer|any = await axios.get(mallServiceUrl + `service/payment/customers?key=lineId&value=${bankingChatModel.chatId}`).then(result => {
            return result.data.customers[0] as Customer
        })
        const time = new Date().getTime();
        if (customer) {
            console.log(bankingChatModel)
            const oldBalance = customer.account.balance
            if (bankingChatModel.action == "pay") {
                customer.account.balance = oldBalance - bankingChatModel.amount
                let record: Record = {
                    transactionId: bankingChatModel.transactionId,
                    shopId: bankingChatModel.shopId,
                    customerId: customer.memberId,
                    action: bankingChatModel.action,
                    value: time
                }
                axios.post(mallServiceUrl + `service/mall/records`, { record })
                record = {
                    transactionId: bankingChatModel.transactionId,
                    shopId: bankingChatModel.shopId,
                    customerId: customer.memberId,
                    action: "payAmount",
                    value: bankingChatModel.amount
                }
                axios.post(mallServiceUrl + `service/mall/records`, { record })
            }
            else if (bankingChatModel.action == "deposit") {
                customer.account.balance = oldBalance + bankingChatModel.amount
                let record: Record = {
                    shopId: bankingChatModel.shopId,
                    customerId: customer.memberId,
                    action: "depositeAmount",
                    value: bankingChatModel.amount
                }
                axios.post(mallServiceUrl + `service/mall/records`, { record })
            }

            axios.put(mallServiceUrl + `service/payment/customers`, { customer })
            bankingChatModel.oldBalance = oldBalance
            bankingChatModel.customerId = customer.memberId
            bankingChatModel.newBalance = customer.account.balance

            res.send({ bankingChatModel })
        }
        else {
            res.status(400).send("支付錯誤：顧客不存在")
        }
    })
})

export const carry = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        const carryChatModel = req.body.carryChatModel as CarryChatModel
        let customer = await axios.get(mallServiceUrl + `service/carrier/customers?key=weChatId&value=${carryChatModel.chatId}`).then(result => {
            return result.data.customers[0]
        })
        if (customer) {
            const time = new Date().getTime();
            let record = {
                transcationId: carryChatModel.transactionId,
                shopId: carryChatModel.shopId,
                customerId: customer.memberId,
                action: "carry",
                value: time
            }
            axios.post(mallServiceUrl + `service/mall/records`, { record })

            carryChatModel.address = carryChatModel.place == "住家" ? customer.address.home : customer.address.office

            res.send({ carryChatModel })
        } else {
            res.status(400).send("配送錯誤：顧客不存在")
        }
    })
})

export const getChatId = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        const shopId = req.body.shopId
        const channel = req.body.channel
        const customerId = req.body.customerId
        console.log(customerId)
        let path
        switch (shopId) {
            case "11":
                path = "insurance"
                break
            case "12":
                path = "payment"
                break
            case "13":
                path = "carrier"
                break
        }

        let customer: Customer = await axios.get(mallServiceUrl + `service/${path}/customers?key=memberId&value=${customerId}`).then(result => {
            return result.data.customers[0] as Customer
        })

        let chatId
        console.log(customer)
        switch (channel) {
            case "Line":
                chatId = customer.lineId
                break
            case "WeChat":
                chatId = customer.weChatId
                break
        }
        res.status(200).send({ chatId })
    })
})