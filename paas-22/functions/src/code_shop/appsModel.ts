export type Shop = {
    shopId: string,
    line?: {
        channelId: string,
        channelSecret: string
    },
    weChat?: {
        appid: string,
        appSecret: string
    }
}

export type ShopMessage = {
    userId: string,
    channel: string,
    event: string,
    object: any
}

export type ChannelMessage = {
    shopId: string,
    channel: string,
    userId: string,
    replyMessage: ReplyMessage[]
}

export type ReplyMessage = {
    type: string,
    message: string,
}