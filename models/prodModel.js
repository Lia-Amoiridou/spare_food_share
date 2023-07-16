const mongoose = require('mongoose')
const ProdSchema = new mongoose.Schema({
    prod_name: { type: String, required: true },
    name: { type: String, required: false },
    prod_desc: { type: String, required: true },
    prod_path: { type: String, required: true }, // add by Jia
    exp_date: { type: Date, required: false },
    sold_or_expired: { type: Boolean, default: false },
    city: { type: String, required: false },
    tags: [{ type: String, required: false }],
    images: { type: mongoose.Schema.Types.ObjectId, ref: 'images' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
})

prod = mongoose.model("prodData", ProdSchema)

module.exports =prod
