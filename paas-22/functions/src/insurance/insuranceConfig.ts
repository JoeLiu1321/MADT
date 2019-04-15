export const shop = {
    shopId: "107598063_shop",
    name: "黑心商店",
    line: {
        channelId: "1649586736",
        channelSecret: "d302bfd9616f975ca87c8aa921640a8b",
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
    topicPath: "projects/paas-hw1-22-232110/topics/",   
    subPath: "projects/paas-hw1-22-232110/subscriptions/",  
}

export const topicName = "topicForChat"

export const insuranceServiceUrl = "https://us-central1-paas-hw1-22-232110.cloudfunctions.net/handOverToShop"
export const paymentServiceUrl = "https://789a891c.ngrok.io/paas-hw1-22-232110/us-central1/handOverToPayment"
export const carrierServiceUrl = "https://us-central1-paas-hw1-22-232110.cloudfunctions.net/"

export const sessionServiceUrl = "https://us-central1-paas-hw1-22-232110.cloudfunctions.net/"
// export const sessionServiceUrl="http://789a891c.ngrok.io/paas-hw1-22-232110/us-central1/"