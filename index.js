const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion } = require('mongodb');

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

    }
    finally { }
}
run().catch(err => console.log(err))

app.listen(port, () => console.log(`pcmart runing on ${port}`))