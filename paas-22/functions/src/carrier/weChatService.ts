import axios from 'axios'

export const toTextMessage = (channelId: string, replyMessage: any): any => {
    const textMessage = {
        touser: channelId,
        msgtype: "text",
        text: { content: replyMessage.message }
    }
    return textMessage
}

export const pushMessage = async (shop: any, wechatMessage: any): Promise<any> => {
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

export const getAccessToken = async (WECHAT: any): Promise<string> => {
    let accessToken
    const apiUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT.appid}&secret=${WECHAT.appSecret}`
    return axios.get(apiUrl).then(result => {
        console.log(result.data);
        accessToken = result.data.access_token
        console.log("Get WechatToken : ", accessToken)
        return accessToken
    })
}
