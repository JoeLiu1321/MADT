export const getPrice = (productName: string): number => {
    let price=0
    switch (productName) {
        case "幸福一生":
            price = 10000
            break
        case "健康致富":
            price = 20000
            break
        case "安養久久":
            price = 30000
            break
    }
    return price
}