export type DialogMessage = {
    channel: string,
    userId: string,
    agent?: string
    userMessage?: UserMessage,
    replyMessages?: ReplyMessage[]
}

export type UserMessage = {
    type: string,
    intent: string,
}

export type ReplyMessage = {
    type: string,
    message: string,
}