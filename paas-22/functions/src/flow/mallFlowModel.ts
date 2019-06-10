export type FollowChatModel = {
    shopId: string
    channel: string
    chatId: string
    customerId: string
    customerName?: string
    customerPhone: string
}

export type BuyChatModel = {
    transactionId?: string
    shopId: string
    chatId: string
    customerId?: string
    productName: string
    productPrice?: number
}

export type BankingChatModel = {
    transactionId: string
    shopId: string
    chatId: string
    customerId?: string
    action?: string
    amount?: number
    oldStratoBalance?: number
    newStratoBalance?: number
    oldBalance?: number
    newBalance?: number
}

export type CarryChatModel = {
    transactionId: string
    shopId: string
    chatId: string
    customerId?: string
    place?: string
    address?: string
}


export type Member = {
    memberId: string
    name: string
    phone: string
}

export type Customer = {
    memberId: string
    lineId?: string
    weChatId?: string
    stratoId?: string
    token?: string
    account?: {
        balance: number
    }
    address?: {
        home: string
        office: string
    }
}

export type Product = {
    id: string
    name: string
    price: number
}

export type Record = {
    id: string
    transactionId?: string
    shopId: string
    customerId: string
    action: string
    amount?: number
    error?: string
    timestamp: number
}
