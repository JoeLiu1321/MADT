export const DIALOGFLOW = {
    path: "PaaS-hw1-21-f0789b7eb3aa.json",
    projectId: "paas-hw1-21-232110",
    languageCode: 'zh-TW'
}

export const ASSISTANT = {
    username: "apikey",
    password: "QUpe5bls21WCkn1KQ8eIDu2cJWGYyENFyLCwejmu6fG7",
    url: "https://gateway-tok.watsonplatform.net/assistant/api",
    version: "2018-11-08",
    assistantId: "0bef08d8-1ca8-409e-9d48-89d7711663bf"
}

export const pubsubConfig = {
    serviceAccountPath: "./serviceAccountKey_pub_sub.json",
    topicPath: "projects/paas-hw1-22-232110/topics/",   
    subPath: "projects/paas-hw1-22-232110/subscriptions/",  
}

export const shops=
{
    payment:{
        id:"12",
        shopId: "payment",
        name: "鄉民寶支付",
        line: {
            channelId: "1557840648",
            channelSecret: "f4e385c61f1f43218c8d2b098711ba66",
        }
    },
    codeShop:{
        id:"11",
        shopId: "insurance",
        name: "幽默學程式",
        line: {
            channelId: "1649586736",
            channelSecret: "d302bfd9616f975ca87c8aa921640a8b",
        }
    },
    carrier:{
        id:"13",
        shopId: "carrier",
        name: "bug carrier",
        line: {
            channelId: "1649586736",
            channelSecret: "d302bfd9616f975ca87c8aa921640a8b",
        }
    },
    shop3c:{
        id: "14",
        name: "智能3c",
        line: {
            channelId: "1649586736",
            channelSecret: "d302bfd9616f975ca87c8aa921640a8b"
        }
    }
}

export const APIGEE = {
    url:"https://angrybirdliu-eval-prod.apigee.net/",
    apikey:"J2Gq3M2NKlLFcpFyisqlRZB82vdkPr2a"
}

export const iMallAccount = {
    name: "superUser",
    password: "super",
    token: "2019Apps",
    address: "8a5e1e8e94aa15cdb9bf7b2621d32469bcd2056e"
}

export const accountBalanceContract = {
    name: "AccountBalance",
    address: "2aabee29fa5d198758e8bbe62c2297030a44dd76"
}

export const blockChainUrl = "http://104.198.234.134/bloc/v2.2"

export const topicName = "topicForChat"
export const paymentSub="payment"
export const codeShopSub="codeShop"
export const cloud="https://us-central1-paas-hw1-22-232110.cloudfunctions.net/"
export const local="http://94d8d571.ngrok.io/paas-hw1-22-232110/us-central1/"
export const url=local