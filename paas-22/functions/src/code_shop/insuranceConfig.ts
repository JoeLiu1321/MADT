export const shop = {
    shopId: "107598009",
    name: "智能保險",
    line: {
        channelId: "1649586736",
        channelSecret: "d302bfd9616f975ca87c8aa921640a8b",
    }
}

export const DIALOGFLOW = {
    path: "PaaS-hw1-21-f0789b7eb3aa.json",
    projectId: "paas-hw1-21-232110",
    languageCode: 'zh-TW'
}

export const ASSISTANT = {
    username: "apikey",
    password: "URAWWPniMLDUTDeyBSvyhEFaa6vcdU15gmJsvV8SFsx_",
    url: "https://gateway.watsonplatform.net/assistant/api",
    version: "2018-11-08",
    assistantId: "75f77424-9eb2-453e-b7e3-e52a897b6aa6"
}

export const pubsubConfig = {
    serviceAccountPath: "./serviceAccountKey_pub_sub.json",
    topicPath: "projects/apps-228904/topics/",   
    subPath: "projects/apps-228904/subscriptions/subChat",  
}

export const topicName = "topicForChat"

export const insuranceServiceUrl = "https://us-central1-paas-hw1-22-232110.cloudfunctions.net/"
export const paymentServiceUrl = "https://us-central1-paas-hw1-22-232110.cloudfunctions.net/"
// export const paymentServiceUrl="https://789a891c.ngrok.io/paas-hw1-22-232110/us-central1/"
export const carrierServiceUrl = "https://us-central1-paas-hw1-22-232110.cloudfunctions.net/"
// export const sessionServiceUrl = "http://789a891c.ngrok.io/paas-hw1-22-232110/us-central1/"
export const sessionServiceUrl = "https://us-central1-paas-hw1-22-232110.cloudfunctions.net/"

// http://340c5dfe.ngrok.io
// export const insuranceServiceUrl = "http://340c5dfe.ngrok.io/paas-hw1-21-232110/us-central1/lineWebhook"
// export const paymentServiceUrl = "http://340c5dfe.ngrok.io/paas-hw1-21-232110/us-central1/handOverToShop"
// export const carrierServiceUrl = "http://340c5dfe.ngrok.io/paas-hw1-21-232110/us-central1/handOverToPayment"
// export const sessionServiceUrl = "https://us-central1-paas-hw1-21-232110.cloudfunctions.net/"