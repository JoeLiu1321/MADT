let balance = 15000
let minBalance = 50000
export const getBalance = (): number => {
    return balance
}

export const getMininumBalance = (): number => {
    return minBalance
}

export const updateBalance = (newBalance:any): void => {
    balance = newBalance
}