// Import modules
const express = require('express')  // framework
const app = express()
const ejs = require('ejs')  // front-end rendering
const hbs = require("hbs")
const bodyParser = require('body-parser')  // data transfer
const mongoose = require('mongoose')  // database
const session = require('express-session')  // client status
const mongoStore = require('connect-mongo')(session)  // session for database

// Get Routers
const router_get = require('./router/get')
const router_post = require('./router/post')


// Connect to the database
const mongoDB = 'mongodb+srv://Agnesia:Agne9227@sparefs.syeuzzs.mongodb.net/sfs'
mongoose.connect(mongoDB, {
    // Eliminate warnings
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (!err){
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('MongoDB Connection Failed: ' + err)
    }
})

// Get the default database connection
const db = mongoose.connection
// Bind the connection to an error event (To get an indication when connection error)
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
// Connection open/close event occurs only once
db.once('open', function () {})
db.once('close', function () {})

// Session for database?
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: new mongoStore({
        mongooseConnection: db
    })
}))



// Render front-end (Problems to be fixed)
app.use(express.static(__dirname + '/views'))
// app.engine('html', ejs.renderFile)
// app.set('view engine', 'html')
app.set("view engine", "html")
app.engine('html', hbs.__express)

// Get data from front-end (json format)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


// Route
app.use(router_get)
app.use(router_post)


// Bind and listen for connections on the specified host and port
app.listen(3000, () => {
    console.log('Welcome to SpareFoodShare!')
})
