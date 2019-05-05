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

export type BankingChatModel = {
    transactionId: string
    shopId: string
    chatId: string
    action?: string
    amount?: number
    oldBalance?: number
    newBalance?: number
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