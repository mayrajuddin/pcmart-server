const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const jwt = require('jsonwebtoken');
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

function verifiyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send('unauthorized access')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next()
    })
}
async function run() {
    try {

        const usersCollection = client.db('pcMart').collection('users');
        const productCatagoryCollection = client.db('pcMart').collection('productCatagory')
        const productsCollection = client.db('pcMart').collection('products')
        const bookingsProductsCollection = client.db('pcMart').collection('sellProducts')

        // insert user
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        // show all user
        app.get('/users', async (req, res) => {
            const query = {}
            const users = await usersCollection.find(query).toArray()
            res.send(users)
        })

        // chack admin 
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const user = await usersCollection.findOne(query)
            res.send({ isAdmin: user?.role === 'admin' })
        })

        // delete user
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })

        //chacking seller
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const user = await usersCollection.findOne(query)
            res.send({ isSeller: user?.role === 'seller' })
        })

        // make admin 
        app.put('/users/admin/:id', verifiyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email
            const query = { email: decodedEmail }
            const user = await usersCollection.findOne(query)
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options)
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
            const createAt = new Date()
            const result = await productsCollection.insertOne({ ...product, createAt: createAt })
            res.send(result)
        })
        //show product to client
        app.get('/products', async (req, res) => {
            const query = { adsOn: true }
            const options = await productsCollection.find(query).sort({
                createAt: -1
            }).toArray()
            res.send(options)
        })
        //show product to client
        app.get('/advertize', async (req, res) => {
            const query = { adsOn: true }
            const options = await productsCollection.find(query).sort({
                createAt: -1
            }).toArray()
            res.send(options)
        })
        // show seller product
        app.get('/sellerProducts', async (req, res) => {
            const email = req.query.email
            const query = {
                sellerEmail: email
            }
            const result = await productsCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/advertize/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.updateOne(query, {
                $set: {
                    adsOn: true,
                }
            })
            res.send(result)
        })

        app.get('/verifyUser/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.updateOne(query, {
                $set: {
                    verify: true,
                }
            })
            res.send(result)
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })

        //show product from category
        app.get('/products/:id', async (req, res) => {
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

        // save buying product  details
        app.post('/bookings', async (req, res) => {
            const booking = req.body
            const result = await bookingsProductsCollection.insertOne(booking)
            res.send(result)
        })

        //show user buying product
        app.get('/bookings', async (req, res) => {
            const email = req.query.email

            const query = { email: email }
            const bookings = await bookingsProductsCollection.find(query).toArray()
            res.send(bookings)
        })
        // for payment
        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const booking = await bookingsProductsCollection.findOne(query)
            res.send(booking)
        })
        // get token
        app.get('/jwt', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        })

    }
    finally { }
}
run().catch(err => console.log(err))

app.listen(port, () => console.log(`pcmart runing on ${port}`))