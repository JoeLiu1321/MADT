import * as functions from 'firebase-functions'
import * as firebaseAdmin from "firebase-admin"
import * as cors from 'cors'
import { Member , Record, Friend } from './mallServiceModel';

const corsHandler = cors({ origin: true })
const memberCollection = firebaseAdmin.firestore().collection("Member");
const recordCollection = firebaseAdmin.firestore().collection("Record");
const friendCollection=firebaseAdmin.firestore().collection("Friend");
export const members = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        switch (req.method) {
            case "POST":
                createMember(req, res)
                break
            case "GET":
                getMember(req, res)
                break
            case "PUT":
                updateMember(req, res)
                break
            case "DELETE":
                deleteMember(req, res)
                break
            default:
                break
        }
    })
})

const createMember = (req:any, res:any) => {
    const member = req.body.member
    memberCollection.doc(member.id).create(member)
    res.status(200).send("OK")
}

const getMember = async (req:any, res:any) => {
    const queryKey = req.query.key
    const queryValue = req.query.value
    let members:any = []
    if (queryKey) {
        let firestoreQuery = memberCollection as FirebaseFirestore.Query
        if (!Array.isArray(queryKey)) {
            firestoreQuery = firestoreQuery.where(queryKey, "==", queryValue)
        }
        else {
            for (const key in queryKey)
                firestoreQuery = firestoreQuery.where(queryKey[key], "==", queryValue[key])
        }
        await firestoreQuery.get().then(snapshot => {
            if (snapshot.docs.length > 0) {
                for (const firestoreDoc of snapshot.docs)
                    members.push(firestoreDoc.data() as Member)
            }
        })
        res.status(200).send({members})
    }
    else {
        await memberCollection.get().then(snapshot => {
            for (const firestoreDoc of snapshot.docs)
                members.push(firestoreDoc.data() as Member)
        })
        res.status(200).send({members})
    }
}

const updateMember = (req:any, res:any) => {
    const member = req.body.member
    memberCollection.doc(member.id).set(member, { merge: true })
    res.status(200).send("OK")
}

const deleteMember = (req:any, res:any) => {
    const memberId = req.query.memberId
    memberCollection.doc(memberId).delete()
    res.status(200).send("OK")
}

export const records = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        switch (req.method) {
            case "POST":
                createRecord(req, res)
                break
            case "GET":
                getRecord(req, res)
                break
            case "PUT":
                break
            case "DELETE":
                break
            default:
                break
        }
    })
})

const createRecord = async (req:any, res:any) => {
    const record = req.body.record as Record
    await recordCollection.doc().create(record)
    res.status(200).send("OK")
}

const getRecord = async (req:any, res:any) => {
    const queryKey = req.query.key
    const queryValue = req.query.value
    if (queryKey) {
        let records:any = []
        let firestoreQuery = recordCollection as FirebaseFirestore.Query
        if (!Array.isArray(queryKey)) {
            firestoreQuery = firestoreQuery.where(queryKey, "==", queryValue)
        }
        else {
            for (const key in queryKey)
                firestoreQuery = firestoreQuery.where(queryKey[key], "==", queryValue[key])
        }
        await firestoreQuery.get().then(snapshot => {
            if (snapshot.docs.length > 0) {
                for (const firestoreDoc of snapshot.docs)
                    records.push(firestoreDoc.data() as Record)
            }
        })
        res.status(200).send({ records })
    }
    else {
        let records:any = []
        await recordCollection.get().then(snapshot => {
            for (const firestoreDoc of snapshot.docs)
                records.push(firestoreDoc.data() as Record)
        })
        res.status(200).send({ records })
    }
}

export const friends = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        switch (req.method) {
            case "POST":
                createMember(req, res)
                break
            case "GET":
                getFriend(req, res)
                break
            case "PUT":
                updateMember(req, res)
                break
            case "DELETE":
                deleteMember(req, res)
                break
            default:
                break
        }
    })
})

const getFriend=async(req:any,res:any)=>{
    const queryValue = req.query.value
    let friends:any = []
    if (queryValue) {
        let doc = friendCollection.doc(queryValue).collection("list")
        await doc.get().then(result=>{
            for(const doc of result.docs)
                friends.push(doc.data() as Friend)
        })
    }
    else {
        await friendCollection.get().then(async snapshot => {
            for (const firestoreDoc of snapshot.docs){
                await firestoreDoc.ref.collection("list").get().then(result=>{
                    let value:any=[]
                    for(const doc of result.docs)
                        value.push(doc.data()as Friend)
                    friends.push({user:firestoreDoc.id,value:value})
                })
            }
        })
    }
    res.status(200).send({ friends })
}