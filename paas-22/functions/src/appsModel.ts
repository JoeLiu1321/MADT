export type DialogMessage = {
    channel: string,
    userId: string,
    userMessage?: UserMessage,
    replyMessage?: ReplyMessage | ReplyMessage[]
    agent?:string
}

export type UserMessage = {
    type: string,
    intent: string,
}

export type ReplyMessage = {
    type: string,
    message: string,
}