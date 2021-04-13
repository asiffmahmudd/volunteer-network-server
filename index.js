const express = require('express')
const app = express()
const port = 4000
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

app.use(bodyParser.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a3ov0.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const volunteersCollection = client.db(process.env.DB_NAME).collection("volunteers");
  const eventsCollection = client.db(process.env.DB_NAME).collection("events");
  
  app.post('/addVolunteer', (req,res) => {
    const volunteer = req.body;
    volunteersCollection.insertOne({volunteer})
    .then(result => {
        res.send(result.insertedCount > 0);
    })
  })

  app.get('/volunteerList', (req,res) => {
    volunteersCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  app.delete('/deleteVolunteer/:id', (req,res) => {
    volunteersCollection.deleteOne({ 
      _id : ObjectId(req.params.id)
    })
    .then(result => {
      res.send(result.deletedCount > 0)
    })
  })

  app.post('/addEvent', (req,res) => {
    const event = req.body;
    eventsCollection.insertOne({event})
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  app.get('/events', (req,res) => {
    eventsCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  app.get('/event/:name', (req,res) => {
    eventsCollection.find({ $text: { $search: req.params.name }})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port)