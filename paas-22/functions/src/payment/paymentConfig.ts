export const shop = {
    shopId: "107598063_payment",
    name: "黑心支付",
    line: {
        channelId: "1557840648",
        channelSecret: "f4e385c61f1f43218c8d2b098711ba66",
    }
}

export const DIALOGFLOW = {
    path: "./serviceAccountKey_dialogflow.json",
    projectId: "paas-hw1-22-232110",
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
    topicPath: "projects/apps-228904/topics/",   
    subPath: "projects/apps-228904/subscriptions/subChat",  
}

export const topicName = "topicForChat"

export const insuranceServiceUrl = "https://us-central1-paas-hw1-22-232110.cloudfunctions.net/handOverToShop"
export const paymentServiceUrl = "https://us-central1-paas-hw1-22-232110.cloudfunctions.net/handOverToPayment"
export const carrierServiceUrl = "https://us-central1-paas-hw1-22-232110.cloudfunctions.net/"

export const sessionServiceUrl = "https://us-central1-paas-hw1-22-232110.cloudfunctions.net/"
// export const sessionServiceUrl="https://789a891c.ngrok.io/paas-hw1-22-232110/us-central1/"