export type DialogMessage = {
    channel: string,
    userId: string,
    userMessage?: UserMessage,
    replyMessage?: ReplyMessage
}

export type UserMessage = {
    type: string,
    intent?: string,
    mediaId?: string,
    locationX?: string,
    locationY?: string
}

export type ReplyMessage = {
    type: string,
    message?: string,
    messages?: Insurance[],
    mediaId?: string
}
export type Insurance = {
    name: string,
    price: number,
    doc: string
}