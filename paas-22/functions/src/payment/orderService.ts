export type Order={
    orderId:string,
    shopId:string,
    product:string,
    price:number,
    consumerId:string
    isPay:boolean
}

export const allOrder=[
    {
        orderId:"1",
        shopId:"107598063",
        product:"幸福一生",
        price:5000,
        consumerId:"U4b1a50220331b00658160849e49605bf",
        isPay:true  
    },
    {
        orderId:"2",
        shopId:"107598063",
        product:"幸福一生",
        price:5000,
        consumerId:"U4b1a",
        isPay:false  
    },
    {
        orderId:"3",
        shopId:"幽默學程式",
        product:"c++",
        price:5000,
        consumerId:"U4b1a50220331b00658160849e49605bf",
        isPay:false  
    },
    {
        orderId:"4",
        shopId:"黑心商店",
        product:"黑心產品",
        price:5000,
        consumerId:"U4b1a50220331b00658160849e49605bf",
        isPay:false  
    },
]

// export const addOrder=(order:Order):void=>{
//     let orders:Order[]=getAllOrder()
//     orders.push(order)
//     const fs=require("fs")
//     fs.writeFile('./test1.json', JSON.stringify({"order":orders}), (err:any) => { 
//         if (err) 
//           throw err;
//         else
//           console.log('Data written to file');
//     });
//     console.log(orders)
// }

// const getAllOrder=():Order[]=>{
//     let order=require('./order.json')
//     return order.order
// }

const transferOrderKey=(key:string):string =>{
    let ret=key;
    switch(key){
        case "orderId":
            ret="訂單編號"
            break;
        case "shopId":
            ret="商店代號"
            break;
        case "product":
            ret="商品"
            break;
        case "price":
            ret="價格"
            break;
        case "consumerId":
            ret="消費者"
            break;
        case "isPay":
            ret="已付款"
            break;
    }
    return ret;
}

export const generateOrderMessage = (order:Order|any) : string =>{
    let result="";
    // delete order.consumerId
    for(const key in order){
        if(key=="consumerId")
            continue;
        const value=order[key];
        result=result+transferOrderKey(key)+" : "+value+" , "
    }
    return result+"\n"
}

export const getAllOrdersByConsumerId = (consumerId:string):string => {
    let orders="\n"
    for(const order of allOrder){
        if(consumerId == order.consumerId)
            orders+=generateOrderMessage(order)
    }
    return orders
}

export const getUnpayOrder=(consumerId:string):string =>{
    let orders="\n"
    for(const order of allOrder){
        if(consumerId == order.consumerId && (!order.isPay))
            orders+=generateOrderMessage(order)
    }
    return orders
}

export const getOrderByOrderId=(orderId:string|any):Order|any =>{
    for(const order of allOrder){
        if(orderId == order.orderId)
            return order
    }
    return null
}