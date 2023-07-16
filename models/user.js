// connect database for users

// Get modules
const mongoose = require('mongoose')  // database
const Schema = mongoose.Schema  // skeleton


// Define a schema for user collection/table
// Attributes: unique id, username, password, email address, phone number, email verification, ...
const userSchema = new Schema( {
    _id: mongoose.Schema.Types.ObjectId,  // primary key
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    // phone: String,
    iv: String,  // attribute used for password encryption/decryption
    verified: {  // attribute used for email verification
        type: Boolean,
        required: true,
        default: false
    },
    type: {
        type: String,
        required: true,
        default: "individual"
    }
})


// Expose the interface
// Schema generates Model (with manipulation capability)
module.exports = mongoose.model('User', userSchema)






