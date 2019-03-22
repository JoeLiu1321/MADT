export type DialogMessage = {
    channel: string,
    userId: string,
    agent?: string
    userMessage?: UserMessage,
    replyMessage?: ReplyMessage | ReplyMessage[]
}

export type UserMessage = {
    type: string,
    intent: string,
}

export type ReplyMessage = {
    type: string,
    message: string,
}

export type ShopMessage = {
    userId:string,
    channel:string,
    event:string,
    object:any
}