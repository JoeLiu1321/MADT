import * as functions from "firebase-functions"
import * as firebaseAdmin from "firebase-admin"
firebaseAdmin.initializeApp(functions.config().firebase)

import * as line from "./lineWebhook"
import * as weChat from "./weChatWebhook"

export const lineWebhook = line.lineWebhook
export const weChatWebhook = weChat.weChatWebhook
