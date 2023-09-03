const express = require('express');
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken')

const app = express()
const port = process.env.port || 5000 ;
app.use(cors())
app.use(express.json())






const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@photo-village.kapv1dn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const verifyToken = (req,res,next) => {

  const authHeader = req?.headers?.authorization
 

  if(!authHeader){
    return res.status(401).send({message:'unAuthorized user'})
  }

  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.TOKEN_SIGNATURE , function(err, decoded) {
    if(err){
     return res.status(403).send({message:'forbidden access'})
    }

    req.decoded = decoded;
    next()


  });
}



async function run(){
    const serviceCollection = client.db("photo_village").collection("photographer_services");
    const reviewCollection = client.db("service_review").collection("services_review_data");


    try{


      // jwt api 

      app.post('/jwt',(req,res)=>{
        const user = req.body;
        
        const token = jwt.sign(user, process.env.TOKEN_SIGNATURE , { expiresIn: '10h' })

          console.log(token)
          res.send({token})
      })












        // get APIs

      // all service in service route 

       app.get('/services',async(req,res)=>{
        const query = {}
        const cursor = serviceCollection.find(query)
        const result= await cursor.toArray()
        res.send(result)
       })




      //  for limit load in HOME page 

       app.get('/limitService',async(req,res)=>{
        const query = {}
        const cursor = serviceCollection.find(query).limit(3)
        const result= await cursor.toArray()
        res.send(result)
       })



      //  individual service details show

      app.get('/servDetails/:id',async(req,res)=>{
        const id = req.params;
        const query = {_id:new ObjectId(id)}
        const result = await serviceCollection.findOne(query);
        res.send(result)
      })




      //its a review api . arry srot by time . dicending.sort({_id:-1}) now acending sort({_id:1})

      app.get('/serviceReview/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {serviceId:id}
        const result = await reviewCollection.find(query).sort({_id:-1}).toArray();
        res.send(result)
      })




      // specific user review collection

      app.get('/myreview/:email', verifyToken , async(req,res)=>{
        
        // console.log(req.headers.authorization);

        const decoded = req.decoded;

        console.log(decoded);

        if(decoded?.email === req.params?.email){

          const email = req.params.email;
          const query = { reviewerEmail : email }
          const result = await reviewCollection.find(query).toArray()
          res.send(result)
  
        }else{
          
   
        res.send({message:'unAuthorized User'})
        }


      })





      // POST APIs 

      app.post('/serviceReview',async(req,res)=>{
          const reviewObj = req.body;
          const result = await reviewCollection.insertOne(reviewObj);
          res.send(result)

      })





      // DELETE APIs 

      app.delete('/myreview/:id',async(req,res)=>{
        const id = req.params;
        const query = {_id:new ObjectId(id)};
        const result = await reviewCollection.deleteOne(query);
        res.send(result)
      })




      //  response for wrong route or API call 

      // app.all('*',async(req,res)=>{
      //   res.send('no Route found')
      // })


      



    }
    finally{

    }
}

run().catch(error => console.log(error))







// check the server OK or NOT
app.get('/',(req,res)=>{
    res.send('photo village server running')
})


app.listen(port,()=>{
    console.log(`server running on port ${port}`)
})