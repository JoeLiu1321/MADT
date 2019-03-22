let balance = 15000
let minBalance = 50000
export const getBalance = () => {
    return balance
}

export const getMininumBalance = () => {
    return minBalance
}

export const updateBalance = (newBalance:any) => {
    balance = newBalance
}