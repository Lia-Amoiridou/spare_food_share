// connect database for items

// Get modules
const mongoose = require('mongoose')  // database
const Schema = mongoose.Schema  // skeleton

// Define a schema for item collection/table
// Attributes: unique id, item_name, description, expired_date, figure, sold_or_expired, location, ...
const itemSchema = new Schema( {
    _id: mongoose.Schema.Types.ObjectId,  // primary key
    item_name: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        require: true,
    },
    item_desc: {
        type: String,
        require: true
    },
    item_url: {
        type: String,  // mapping to a figure
        require: true
    },
    sold_or_expired: {  // attribute used for viewing items
        type: Boolean,
        required: true,
        default: false
    },
    exp_date: {
        type: Date,
        required: true
    },
    tags: [
        {
            type: String,
            required: false
        }
    ],
    city: {
        type: String,
        required: false
    },
    // TODO: more attributes about item ...
    images: { type: mongoose.Schema.Types.ObjectId, ref: 'images' },
    collectedBy: {
        type: String,
        required: false
    }
})

// Expose the interface
// Schema generates Model (with manipulation capability)
module.exports = mongoose.model('Item', itemSchema)