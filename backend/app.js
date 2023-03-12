const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cookieParser=require('cookie-parser')
const bodyParser = require('body-parser')
const errorMiddlewares = require('./middlewares/errors')
const fileUpload = require('express-fileupload')
app.use(express.json())
// app.use(bodyParser.json({limit:'50mb'}))
app.use(bodyParser.urlencoded({ extended: true}))
app.use(cookieParser())
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 }}))




//Import all routes
const product = require('./routes/productRoute')
const auth = require('./routes/authRoute')
const order = require('./routes/orderRoute')

app.use('/api/v1', product)
app.use('/api/v1', auth) 
app.use('/api/v1', order) 

app.use(errorMiddlewares)


module.exports = app;