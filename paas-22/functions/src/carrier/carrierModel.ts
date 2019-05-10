export type DialogMessage = {
    channel: string
    chatId: string
    userMessage?: {
        type: string
        intent?: string
        event?: string
    },
    replyMessages?: Array<{
        type: string
        message: string
    }>
    timestamp:number
}

export type ReplyMessage = {
    channel: string
    chatId: string
    replyMessages: Array<{
        type: string
        message: string
    }>
}

export type FollowChatModel = {
    shopId: string
    channel: string
    chatId: string
    customerName?: string
    customerPhone: string
}

export type CarryChatModel = {
    transactionId: string
    shopId: string
    chatId: string
    place?: string
    address?: string
}

export type HandoverModel = {
    transactionId: string
    fromShopId: string
    toShopId: string
    event: string
    customerId: string
    key: any
    value: any
}