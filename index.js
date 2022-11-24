const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 8000
const app = express()

// middlewere
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
    res.send('pcmart server is running')
})


app.listen(port, () => console.log(`pcmart runing on ${port}`))