const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()
const port = process.env.PORT || 8000
const app = express()

// middlewere
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
    res.send('pcmart server is running')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oejruqx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const usersCollection = client.db('pcMart').collection('users');
        const productCatagoryCollection = client.db('pcMart').collection('productCatagory')
        const productsCollection = client.db('pcMart').collection('products')

        // insert user
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        //get productCatagory 
        app.get('/productCatagory', async (req, res) => {
            const query = {}
            const options = await productCatagoryCollection.find(query).toArray()
            res.send(options)
        })

        // add product
        app.post('/products', async (req, res) => {
            const product = req.body
            const result = await productsCollection.insertOne(product)
            res.send(result)
        })
        //show product to client
        app.get('/products', async (req, res) => {
            const query = {}
            const options = await productsCollection.find(query).toArray()
            res.send(options)
        })

        //show product to client
        app.get('/products/:id', async (req, res) => {
            const query = {}
            // const options = await productsCollection.find(query).toArray()
            const options = await productCatagoryCollection.aggregate([
                {
                    $match: {
                        _id: ObjectId(req.params.id)
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "brandName",
                        foreignField: "brand",
                        as: "products",
                    },
                },
            ]
            ).toArray()

            res.send(options)
        })

    }
    finally { }
}
run().catch(err => console.log(err))

app.listen(port, () => console.log(`pcmart runing on ${port}`))