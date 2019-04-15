import * as functions from "firebase-functions"
import { Client, Message } from "@line/bot-sdk"
const qs = require('querystring');
import axios from 'axios'
import { topicName, shops } from "./lineSubscriberConfig"
import { ChannelMessage, Shop, ReplyMessage } from "./channelMessage";

export const lineSubscriber = functions.pubsub.topic(topicName).onPublish((message) => {
    const channelMessage = JSON.parse(Buffer.from(message.data, 'base64').toString()) as ChannelMessage
    if (channelMessage.channel == "Line") {
        const index = shops.map(shop => shop.shopId).indexOf(channelMessage.shopId)
        const shop: Shop = shops[index]
        let lineMessages = []
        for (const replyMessage of channelMessage.replyMessage) {
            switch (replyMessage.type) {
                case "text":
                    lineMessages.push(toTextMessage(replyMessage))
                    break
            }
        }

        pushMessage(shop, channelMessage.userId, lineMessages)
    }
})

const toTextMessage = (replyMessage: ReplyMessage): Message => {
    const textMessage: Message = {
        type: "text",
        text: replyMessage.message
    }
    return textMessage
}

const pushMessage = async (shop: Shop, userId: string, lineMessage: Message | Message[]): Promise<any> => {
    const accessToken = await getAccessToken(shop.line)
    const lineClient = new Client({
        channelAccessToken: accessToken
    })
    return lineClient.pushMessage(userId, lineMessage)
}

const getAccessToken = async (LINE: any): Promise<string> => {
    let accessToken
    const apiUrl = `https://api.line.me/v2/oauth/accessToken`
    const requestConfig = {
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        }
    }

    const body = {
        "grant_type": "client_credentials",
        "client_id": LINE.channelId,
        "client_secret": LINE.channelSecret
    }

    return axios.post(apiUrl, qs.stringify(body), requestConfig).then(result => {
        accessToken = result.data.access_token
        console.log("Get LineAccessToken : ", accessToken)
        return accessToken
    }).catch(null)
}


