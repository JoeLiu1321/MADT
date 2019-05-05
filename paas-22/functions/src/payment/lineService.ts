import { Client, Message } from "@line/bot-sdk"
const qs = require('querystring');
import axios from 'axios'

export const toTextMessage = (replyMessage: any): Message => {
    const textMessage: Message = {
        type: "text",
        text: replyMessage.message
    }
    return textMessage
}

export const pushMessage = async (shop: any, userId: string, lineMessage: Message | Message[]): Promise<any> => {
    const accessToken = await getAccessToken(shop.line)
    const lineClient = new Client({
        channelAccessToken: accessToken
    })
    return lineClient.pushMessage(userId, lineMessage)
}

export const getAccessToken = async (LINE: any): Promise<string> => {
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


