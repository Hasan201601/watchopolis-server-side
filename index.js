const express = require('express')
const app = express();
const cors = require('cors');
const { MongoClient, Admin } = require('mongodb');
const objectId = require('mongodb').ObjectId
const { query } = require('express');
const port = process.env.PORT || 5000;
require('dotenv').config()

//  middleware
app.use(cors())
app.use(express.json())

//  uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.riwcs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)


async function run() {
    try {
        await client.connect()
        const database = client.db('watchopolis');
        const ordersCollection = database.collection('orders')
        const watchCollection = database.collection('watches')
        const usersCollection = database.collection('users')
        const reviewCollection = database.collection('reviews')

        //  Orders API
        //  GET Orders
        app.get('/orders', async (req, res) => {
            let query = {}
            const email = req.query.email;
            if (email) {
                query = { email: email }
            }
            const cursor = ordersCollection.find(query)
            const result = await cursor.toArray()
            res.json(result)
        })
        //  POST Orders
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order)
            res.json(result)
        })
        // DELETE Order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: objectId(id) }
            const result = await ordersCollection.deleteOne(query);
            res.json(result)
        })

        //  Watches API
        //  GET watches
        app.get('/watches', async (req, res) => {
            const query = {};
            const cursor = watchCollection.find(query)
            const result = await cursor.toArray()
            res.json(result)
        })
        //  GET Orders by id
        app.get('/watches/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: objectId(id) }
            const result = await watchCollection.findOne(query)
            res.json(result)
        })
        //  POST watches
        app.post('/watches', async (req, res) => {
            const body = req.body;
            const result = await watchCollection.insertOne(body)
            res.json(result)
        })
        //  DELETE Watch
        app.delete('/watches/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: objectId(id) }
            const result = await watchCollection.deleteOne(query)
            res.json(result)
        })

        //  Users API
        //  GET User
        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = usersCollection.find(query)
            const result = await cursor.toArray()
            res.json(result)
        })
        //  GET User by Email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })
        //  POST User
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const result = await usersCollection.insertOne(user)
            console.log(result)
            res.json(result)
        })
        //  PUT USER
        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user
            }
            const result = usersCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })
        //  PUT Admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })

        //  Review API
        //  GET Review
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query)
            const result = await cursor.toArray()
            res.json(result)
        })
        //  POST Review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = reviewCollection.insertOne(review)
            res.json(result)
        })
    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('db connected')
})
app.listen(port, () => {
    console.log('listening to port', port)
})