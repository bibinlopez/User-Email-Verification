require('./db/connect')
require('dotenv').config();
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
const notFound = require('./middileware/notFound')
const userRouter = require('./routes/user')



app.use('/user',userRouter)
app.use(notFound)




app.listen(3000,console.log('listening on the port 3000'))