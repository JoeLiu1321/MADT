import { WECHAT } from './chatbotConfig'
import axios from 'axios'

import { DialogMessage , ReplyMessage } from "./appsModel";

export const toTextMessage = (dialogMessage:DialogMessage,replyMessage: ReplyMessage) => {
    const textMessage = {
        touser: dialogMessage.userId,
        msgtype: "text",
        text: { content: replyMessage.message }
    }
    return textMessage
}

export const pushMessage = async (wechatMessage:any): Promise<any> => {
    const accessToken = await getAccessToken()
    const pushMessageUrl = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`
    if (Array.isArray(wechatMessage)) {
        for (const message of wechatMessage)
            await axios.post(pushMessageUrl, message)
    }
    else {
        return axios.post(pushMessageUrl, wechatMessage)
    }
}

export const replyMessage = (res:any, wechatMessage:any): Promise<any> => {
    return res.reply(wechatMessage.text.content)
}

const getAccessToken = async (): Promise<string> => {
    let accessToken
    const apiUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT.appid}&secret=${WECHAT.appSecret}`
    return axios.get(apiUrl).then(result => {
        accessToken = result.data.access_token
        console.log("Get WechatToken : ", accessToken)
        return accessToken
    })

}
