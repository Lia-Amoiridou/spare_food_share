// connect database for chats

// Get modules
const mongoose = require('mongoose')  // database
const Schema = mongoose.Schema  // skeleton


// Define a schema for chat collection/table
// Attributes: unique id, user id, provider id, item_id, from (who), content...
const chatSchema = new Schema( {
    _id: mongoose.Schema.Types.ObjectId,  // primary key
    user_id: {
        type: String,
        required: true,
    },
    provider_id: {
        type: String,
        required: true,
    },
    item_id: {
        type: String,
        required: true,
    },
    from: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true
    }
})


// Expose the interface
// Schema generates Model (with manipulation capability)
module.exports = mongoose.model('Chat', chatSchema)