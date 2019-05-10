import * as config from "../config"
export const shop = {
    id: "13",
    name: "黑貓宅配",
    weChat: {
        appid: "",
        appSecret: "",
        token: "",
        checkSignature: true
    }
}
export const ASSISTANT = config.ASSISTANT

export const sessionServiceUrl = config.url
export const APIGEE = config.APIGEE
export const mallFlowUrl = APIGEE.url
export const mallServiceUrl=config.url
export const pubsubConfig =config.pubsubConfig

export const CarrySubName = "handOverCarrySub"