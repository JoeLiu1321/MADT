import { WECHAT } from './chatbotConfig'
import axios from 'axios'

import { DialogMessage} from "./appsModel";

export const toTextMessage = (dialogMessage: DialogMessage|any) => {
    const textMessage = {
        touser: dialogMessage.userId,
        msgtype: "text",
        text: { content: dialogMessage.replyMessage.message }
    }
    return textMessage
}

export const toTextMessages = (dialogMessage: DialogMessage|any) => {
    let textMessages = []
    for (const message of dialogMessage.replyMessage.messages) {
        dialogMessage.replyMessage.message = `品名：${message.name}\n價格：${message.price}\n<a href="${message.doc}">DM</a>`
        textMessages.push(toTextMessage(dialogMessage))
    }
        
    return textMessages
}

export const toImageMessage = (dialogMessage: DialogMessage|any) => {
    const imageMessage = {
        touser: dialogMessage.userId,
        msgtype: "image",
        image:
        {
            media_id: dialogMessage.replyMessage.mediaId
        }
    }
    return imageMessage
}

export const toVoiceMessage = (dialogMessage: DialogMessage|any) => {
    const voiceMessage = {
        touser: dialogMessage.userId,
        msgtype: "voice",
        voice:
        {
            media_id: dialogMessage.replyMessage.mediaId
        }
    }
    return voiceMessage
}

export const toVideoMessage = (dialogMessage: DialogMessage|any) => {
    const videoMessage = {
        touser: dialogMessage.userId,
        msgtype: "video",
        video:
        {
            media_id: dialogMessage.replyMessage.mediaId
        }
    }
    return videoMessage
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
