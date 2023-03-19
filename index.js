const express = require('express');
const cors = require('cors')
require('dotenv').config()


const app = express()
const port = process.env.port || 5000 ;
app.use(cors())
app.use(express.json())






const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@photo-village.kapv1dn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run(){
    const serviceCollection = client.db("photo_village").collection("photographer_services");


    try{
        // get APIs


       app.get('/services',async(req,res)=>{
        const query = {}
        const cursor = serviceCollection.find(query)
        const result= await cursor.toArray()
        res.send(result)
       })


       app.get('/limitService',async(req,res)=>{
        const query = {}
        const cursor = serviceCollection.find(query).limit(3)
        const result= await cursor.toArray()
        res.send(result)
       })

      app.get('/servDetails/:id',async(req,res)=>{
        const id = req.params;
        const query = {_id:new ObjectId(id)}
        const result = await serviceCollection.findOne(query);
        res.send(result)
      })











      
      app.all('*',async(req,res)=>{
        res.send('no Route found')
      })


      



    }
    finally{

    }
}

run().catch(error => console.log(error))








app.get('/',(req,res)=>{
    res.send('all ok your server >>> running')
})


app.listen(port,()=>{
    console.log(`server running on port ${port}`)
})