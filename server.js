const express = require('express')
const cors = require('cors')
const http = require('http')
const dotenv= require('dotenv')
const {v4:uuidv4}= require('uuid')
const requestMtnToken = require('./utils/requestmtntoken.js')
const pollPaymentStatus = require('./utils/mtnpollpayment.js')
const path = require('path')
const userRouter= require('./routes/userRoute.js')
const webhookRouter= require('./routes/webhook.js')
const addressRouter= require('./routes/getAddress.js')
const orderRouter= require('./routes/orderRoutes.js')
const adminRouter = require('./routes/admin-routes.js')
const productRouter = require('./routes/productRoute.js')
const cartRouter = require('./routes/cartRoutes.js')
const connectDB = require('./mongodb/mongo.js')
const errorHandler = require('./middleware/error-handler.js')

dotenv.config()

const app = express()
app.use(cors())

const server = http.createServer(app)

app.use(express.json())
app.use(express.urlencoded({extended:true}))

connectDB()
app.use('/api/users',userRouter)
app.use('/api/products',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/orders',orderRouter)
app.use('/api/payments',webhookRouter)
app.use('/api/location',addressRouter)
app.use('/api/admin',adminRouter)

app.use(errorHandler)

const PORT = process.env.PORT

const subscriptionKey = process.env.MTN_SUBSCRIPTION_KEY

/*const mock = async () => {
  try {
    const momoHost = "https://sandbox.momodeveloper.mtn.com"

    const userId = process.env.MTN_USER_ID;
  const apiKey = process.env.MTN_API_KEY;
  const basicAuth = Buffer.from(`${userId}:${apiKey}`).toString('base64');

console.log(userId,apiKey,basicAuth,subscriptionKey)
  const res = await fetch(`${momoHost}/collection/token/`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Ocp-Apim-Subscription-Key': subscriptionKey
    },
  });

  const data = await res.json();
  console.log(subscriptionKey)
    const token = data.access_token
    //await requestMtnToken();
    console.log(data)
    const referenceId = uuidv4();

    //process.env.MOMO_BASE_URL;

    const requestUrl = `${momoHost}/collection/v1_0/requesttopay`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': process.env.MTN_TARGET_ENV,
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': process.env.MTN_SUBSCRIPTION_KEY,
    };

    const body = {
      amount: '50000',
      currency: 'UGX',
      externalId: referenceId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: "46733123453",
      },
      payerMessage: 'Payment for your order',
      payeeNote: 'Thanks for shopping',
    };

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
console.log(response)
    if (response.status === 202) {
  setTimeout(() => {
      pollPaymentStatus(referenceId);
    }, 10000);

      console.log('Payment request sent successfully',
        referenceId
      );
    } else {
      const error = await response.text();

console.log('here error',error) }
  }
  catch (e) {
    console.log('error is bad',e)
  }
}*/

//mock()
/*const referenceId = uuidv4()
console.log(referenceId)*/

//async function api() {
  //gets token
/*const res = await fetch(`https://sandbox.momodeveloper.mtn.com/collection/token/`, {
  method: "POST",
  headers: {
    Authorization: `Basic ${Buffer.from(`5161d8f3-a6db-4ff1-be56-30f8c02e4f08:a607cfe5fe4b48a8a11758baf9548b6c`).toString("base64")}`,
    "Ocp-Apim-Subscription-Key":'5733d90cb44c4f868f9cdf77e85cbd91'
  }
});*/

//get user id
/*const ref = await fetch(`https://sandbox.momodeveloper.mtn.com/v1_0/apiuser`, {
  method: "POST",
  headers: {
    "Ocp-Apim-Subscription-Key":"5733d90cb44c4f868f9cdf77e85cbd91",
    "X-Reference-Id": referenceId, // a UUID
    "Content-Type": "application/json",
  },
 body: JSON.stringify({
    providerCallbackHost: "https://localh.com/mtn-callback"
  })
});*/
/*const ref = await fetch(`https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/5161d8f3-a6db-4ff1-be56-30f8c02e4f08/apikey`, {
  method: "POST",
  headers: {
    "Ocp-Apim-Subscription-Key":'5733d90cb44c4f868f9cdf77e85cbd91'
  }
});*/

/*const { access_token } = await res.json();

  
  //console.log(access_token)
  //const key = await ref.json()
  console.log(res)
  console.log(access_token)*/
//}
//api()
server.listen(PORT,()=>{
  console.log('🚀🚀🤑💯 Electronics server connected with pride🚀 at port:'+PORT)
})

app.use((req, res, next) => {
  console.log(`Unhandled route: ${req.method} ${req.originalUrl}`);
  res.status(404).send('Route not found');
});

