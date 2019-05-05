import * as functions from 'firebase-functions'
import * as cors from 'cors'
const {PubSub}=require("@google-cloud/pubsub")

import { pubsubConfig, shopTopicName } from "./handoverConfig"

const googlePubsub = new PubSub({ keyFilename: pubsubConfig.serviceAccountPath })
const corsHandler = cors({ origin: true });

export const shopHandover = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        const handoverModel = req.body.handoverModel
        const dataBuffer = Buffer.from(JSON.stringify(handoverModel));
        await googlePubsub.topic(shopTopicName).publisher().publish(dataBuffer).then((res:any) => {
        }).catch((err:any) => {
            console.log(err)
        })
        res.sendStatus(200)
    })
})