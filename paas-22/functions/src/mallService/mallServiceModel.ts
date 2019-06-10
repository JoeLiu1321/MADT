export type Member = {
    memberId: string
    name: string
    phone: string
}

export type Customer = {
    memberId: string
    lineId: string
    weChatId: string
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
    transcationId: string
    shopId:string
    customerId: string
    action:string
    value: number
}

export type Friend={
    name:string
    id:string
}