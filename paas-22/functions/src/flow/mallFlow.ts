import * as functions from 'firebase-functions'
import * as cors from 'cors'
import { mallServiceUrl, blockChainUrl, iMallAccount, accountBalanceContract } from "./mallFlowConfig"
import axios from "axios"
import * as uuid from "uuid/v1"

import { FollowChatModel, BuyChatModel, BankingChatModel, CarryChatModel } from './mallFlowModel';
import { Member, Customer, Product, Record } from './mallFlowModel';

const corsHandler = cors({ origin: true });

export const bindCustomer = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        let followChatModel = req.body.followChatModel as FollowChatModel
        const member: Member = await axios.get(mallServiceUrl + `service/mall/members?key=phone&value=${followChatModel.customerPhone}`).then(result => {
            return result.data.members[0] as Member
        })
        if (member) {
            let customer: Customer = await axios.get(mallServiceUrl + `service/shop3c/customers?key=memberId&value=${member.memberId}`).then(result => {
                return result.data.customers[0] as Customer
            })
            if (customer) {
                customer["lineId"] = followChatModel.chatId
                axios.put(mallServiceUrl + `service/shop3c/customers`, { customer })
            }
            else {
                const accountId = await axios.post(`${blockChainUrl}/users/${encodeURI(member.name)}?faucet=true`, JSON.stringify(member.memberId), {
                    headers: { "content-type": 'application/json' }
                }).then(result => { return result.data })
                console.log("account", accountId);

                const userToken = uuid()
                await axios.post(`${blockChainUrl}/users/${iMallAccount.name}/${iMallAccount.address}/contract/${accountBalanceContract.name}/${accountBalanceContract.address}/call?resolve=true`, {
                    password: iMallAccount.password,
                    method: "createAccount",
                    args: { accountId: accountId, authenticationToken: iMallAccount.token, userToken: userToken },
                    value: 0
                }).catch(error => console.log(error.response.data))

                customer = {
                    memberId: member.memberId,
                    stratoId: accountId,
                    token: userToken
                }
                customer["lineId"] = followChatModel.chatId
                customer.account = { balance: 100000 }
                customer.address = {
                    home: "台北市大安區愛國東路三段2號",
                    office: "台北市大安區忠孝東路三段1號"
                }
                axios.post(mallServiceUrl + `service/shop3c/customers`, { customer })
            }

            const time = new Date().getTime()
            const record: Record = {
                id: uuid(),
                shopId: followChatModel.shopId,
                customerId: customer.memberId,
                action: "follow",
                timestamp: time
            }
            axios.post(mallServiceUrl + `service/mall/records`, { record })

            followChatModel.customerName = member.name
            console.log(followChatModel)
            res.status(200).send({ followChatModel })
        }
        else {
            res.status(400).send("綁定錯誤：成員不存在")
        }
    })
})

export const buy = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        const buyChatModel = req.body.buyChatModel as BuyChatModel
        let customer: Customer = await axios.get(mallServiceUrl + `service/shop3c/customers?key=lineId&value=${buyChatModel.chatId}`).then(result => {
            return result.data.customers[0] as Customer
        })
        if (customer) {
            console.log("products")
            const product: Product = await axios.get(mallServiceUrl + "service/shop3c/products?key=name&value=" + encodeURI(buyChatModel.productName)).then(result => {
                return result.data.products[0] as Product
            }) 

            const time = new Date().getTime();
            const transcationId = uuid()
            const record: Record = {
                id: uuid(),
                transactionId: transcationId,
                shopId: buyChatModel.shopId,
                customerId: customer.memberId,
                action: "buy",
                timestamp: time
            }
            axios.post(mallServiceUrl + `service/mall/records`, { record })

            buyChatModel.transactionId = transcationId
            buyChatModel.customerId = customer.memberId
            buyChatModel.productPrice = product.price
            console.log(buyChatModel)
            res.send({ buyChatModel })
        } else {
            res.status(400).send("採購錯誤：顧客不存在")
        }
    })
})

export const banking = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        const bankingChatModel = req.body.bankingChatModel as BankingChatModel|any
        let customer: Customer|any = await axios.get(mallServiceUrl + `service/shop3c/customers?key=lineId&value=${bankingChatModel.chatId}`).then(result => {
            return result.data.customers[0] as Customer
        })
        const time = new Date().getTime();
        if (customer) {
            const oldBalance = customer.account.balance
            const oldStratoBalance = await axios.post(`${blockChainUrl}/users/${iMallAccount.name}/${iMallAccount.address}/contract/${accountBalanceContract.name}/${accountBalanceContract.address}/call?resolve=true`, {
                password: iMallAccount.password,
                method: "getBalance",
                args: { accountId: customer.stratoId, token: iMallAccount.token },
                value: 0
            }).then(result => { return Number(result.data.data.contents[0]) })
            console.log("account", oldStratoBalance);
            let newStratoBalance;
            if (bankingChatModel.action == "pay") {
                customer.account.balance = oldBalance - bankingChatModel.amount
                newStratoBalance = oldStratoBalance - bankingChatModel.amount
                let record: Record = {
                    id: uuid(),
                    transactionId: bankingChatModel.transactionId,
                    shopId: bankingChatModel.shopId,
                    customerId: customer.memberId,
                    action: bankingChatModel.action,
                    amount: bankingChatModel.amount,
                    timestamp: time
                }
                axios.post(mallServiceUrl + `service/mall/records`, { record })
            }
            else if (bankingChatModel.action == "deposit") {
                customer.account.balance = oldBalance + bankingChatModel.amount
                newStratoBalance = oldStratoBalance + bankingChatModel.amount
                let record: Record = {
                    id: uuid(),
                    shopId: bankingChatModel.shopId,
                    customerId: customer.memberId,
                    action: bankingChatModel.action,
                    amount: bankingChatModel.amount,
                    timestamp: time
                }
                axios.post(mallServiceUrl + `service/mall/records`, { record })
            }
            axios.put(mallServiceUrl + `service/shop3c/customers`, { customer })
            await axios.post(`${blockChainUrl}/users/${iMallAccount.name}/${iMallAccount.address}/contract/${accountBalanceContract.name}/${accountBalanceContract.address}/call?resolve=true`, {
                password: iMallAccount.password,
                method: "setBalance",
                args: { accountId: customer.stratoId, token: iMallAccount.token, balance: newStratoBalance },
                value: 0
            })
            bankingChatModel.oldStratoBalance = oldStratoBalance
            bankingChatModel.newStratoBalance = newStratoBalance
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
        let customer = await axios.get(mallServiceUrl + `service/shop3c/customers?key=lineId&value=${carryChatModel.chatId}`).then(result => {
            return result.data.customers[0] as Customer|any
        })
        if (customer) {
            const time = new Date().getTime();
            let record = {
                id: uuid(),
                transactionId: carryChatModel.transactionId,
                shopId: carryChatModel.shopId,
                customerId: customer.memberId,
                action: "carry",
                timestamp: time
            }
            axios.post(mallServiceUrl + `service/mall/records`, { record })

            carryChatModel.address = carryChatModel.place == "住家" ? customer.address.home : customer.address.office
            carryChatModel.customerId = customer.memberId

            res.send({ carryChatModel })
        } else {
            res.status(400).send("配送錯誤：顧客不存在")
        }
    })
})