// connect database for users

// Get modules
const mongoose = require('mongoose')  // database
const Schema = mongoose.Schema  // skeleton

// Define a schema for user collection/table
// Attributes: unique id, username, password, email address, phone number, email verification, ...
const donateSchema = new Schema( {
    _id: mongoose.Schema.Types.ObjectId,  // primary key
    user_id: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    }
})


// Expose the interface
// Schema generates Model (with manipulation capability)
module.exports = mongoose.model('Donate', donateSchema)