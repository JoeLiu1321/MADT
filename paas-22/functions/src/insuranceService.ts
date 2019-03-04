export const getProducts = () => {
    const message = `我們有以下商品\n幸福一生 10000元\n健康致富 20000元\n安養久久 30000元\n車體損失險 2000元\n住宅火災險 3000元`
    return message
}

export const getDMList = () => {
    const insurances = [
        {
            name: "幸福一生",
            price: 10000,
            doc: "https://drive.google.com/file/d/1_ZvdIsOiJ1fKYxDQZGRhIVDwaiEKMNds"
        },
        {
            name: "健康致富",
            price: 20000,
            doc: "https://drive.google.com/file/d/1pl-zD-wGwtCx5HD5oW-xXSR0xJRlSSC4"
        },
        {
            name: "安養久久",
            price: 30000,
            doc: "https://drive.google.com/file/d/1Ovbez38hGXik5hQxJ0Vuw15527k7P_E1"
        },
        {
            name: "車體損失險",
            price: 2000,
            doc: "https://drive.google.com/file/d/1hddbqHQQwJTK_hAwDX6W7bS32BqWLp8K"
        },
        {
            name: "住宅火災險",
            price: 3000,
            doc: "https://drive.google.com/file/d/1nQVAa5K-kYS2gu0BX0KLYbepSOYdSNB9"
        }
    ]
    return insurances
}

export const getProductDM = () => {
    const message = `幸福一生DM如下:https://drive.google.com/file/d/1_ZvdIsOiJ1fKYxDQZGRhIVDwaiEKMNds`
    return message
}

export const getProductPrice = () => {
    const message = `幸福一生 10000元`
    return message
}

export const buyProduct = () => {
    const message = `感謝你購買幸福一生(10000元)\n歡迎再度光臨！`
    return message
}

export const getProductImage = () => {
    const mediaId = `frMHE47U72Ml1qB5JIXlqdhAGGT9RqOEtPLHMRA3Wuo`
    return mediaId
}

export const getProductVoice = () => {
    const mediaId = `frMHE47U72Ml1qB5JIXlqXDwHvtwCGoWkPzA6TC3Mhg`
    return mediaId
}

export const getProductVideo = () => {
    const mediaId = `4p5psK5IhSju7s9iddnFn-Ycf2SUdUewXL41QX9ZdW-judjNUzsJZQS48ajgrPSh`
    return mediaId
}

export const getShopLocation =() => { 
    const message = `智能商城地址如下：\n台北市忠孝東路三段一號\n座標：25.043957,121.533920`
    return message
}

