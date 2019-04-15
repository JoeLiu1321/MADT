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

export type Shop = {
    shopId: string,
    name: string,
    line: {
        channelId: string,
        channelSecret: string
    }
}