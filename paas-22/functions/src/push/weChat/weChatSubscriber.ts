import * as functions from "firebase-functions"
import axios from 'axios'
import { topicName, shops } from "./weChatSubscriberConfig"
import { ChannelMessage, Shop, ReplyMessage } from "./channelMessage";

export const weChatSubscriber = functions.pubsub.topic(topicName).onPublish((message) => {
    const channelMessage = JSON.parse(Buffer.from(message.data, 'base64').toString()) as ChannelMessage
    if (channelMessage.channel == "WeChat") {
        const index = shops.map(shop => shop.shopId).indexOf(channelMessage.shopId)
        const shop: Shop = shops[index]
        let weChatMessages = []
        for (const replyMessage of channelMessage.replyMessage) {
            switch (replyMessage.type) {
                case "text":
                    weChatMessages.push(toTextMessage(channelMessage, replyMessage))
                    break
            }
        }

        pushMessage(shop, weChatMessages)
    }
})

const toTextMessage = (channelMessage: ChannelMessage, replyMessage: ReplyMessage): any => {
    const textMessage = {
        touser: channelMessage.userId,
        msgtype: "text",
        text: { content: replyMessage.message }
    }
    return textMessage
}

const pushMessage = async (shop: Shop, wechatMessage: any): Promise<any> => {
    const accessToken = await getAccessToken(shop.weChat)
    const pushMessageUrl = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`
    if (Array.isArray(wechatMessage)) {
        for (const message of wechatMessage)
            await axios.post(pushMessageUrl, message)
    }
    else {
        return axios.post(pushMessageUrl, wechatMessage)
    }
}

const getAccessToken = async (WECHAT: any): Promise<string> => {
    let accessToken
    const apiUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT.appid}&secret=${WECHAT.appSecret}`
    return axios.get(apiUrl).then(result => {
        accessToken = result.data.access_token
        console.log("Get WechatToken : ", accessToken)
        return accessToken
    })
}
