export const getPrice = (productName: string): number => {
    let price:any
    switch (productName) {
        case "C++入門":
            price = 10000
            break
        case "Java新手":
            price = 20000
            break
        case "Python切入":
            price = 30000
            break
    }
    return price
}
