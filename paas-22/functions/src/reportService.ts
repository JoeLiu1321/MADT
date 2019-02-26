export const customerOrders = () => {
    const message = `<your_name> 交易明細\n\n` +
        `交易總數：3次\n\n` +
        `購買總額：100000元\n\n` +
        `近期購買：\n` +
        `2/21：幸福一生 10000元\n` +
        `2/18：健康致富 20000元\n` +
        `2/13：安養久久 30000元`

    return message
}

export const shopOperation = () => {
    const message = `營運報表：\n\n` +
        `顧客總數：4人\n` +
        `產品總數：5個\n` +
        `交易次數：20次\n` +
        `熱門商品：\n` +
        `1：<幸福一生> 已銷售60000元\n` +
        `2：<健康致富> 已銷售40000元\n` +
        `3：<安養久久> 已銷售30000元\n` +
        `超級買家：\n` +
        `1：<your_name> 已購買 60000元\n` +
        `2：<your_name> 已購買 30000元\n` +
        `3：<your_name> 已購買 20000元`

    return message
}