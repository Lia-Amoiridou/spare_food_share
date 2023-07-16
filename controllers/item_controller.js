// Control interaction with item data only

// Get modules
const fs = require("fs")
const url = require("url")
const http = require("http")
const path = require("path")
const mongoose = require('mongoose')  // database

// Get data model
const Item = require('../models/item')

// Feature ?: Search a food item
// Post: item_name
exports.search = async (req, res) => {
    const info = req.body  // request information

    let search_tags = info.search.toString().split(",")

    // Fuzzy Search (with regular matching)
    // const reg = new RegExp("^.*" + tag + ".*$")

    // // Search by item name and tags
    // // $options: 'i' for ignore lowercase/uppercase
    const items = await Item.find({"$and":
            [{"$or":[{item_name: {$in: search_tags}}, {tags: {$in: search_tags}}]},
                {sold_or_expired: false}]}).sort({exp:1})

    res.render("search.html", {search: info.search, items: items})
}


// Feature ?: View a food item
// Post: unique_id (item)?
exports.view = async (req, res) => {
    const item_id = req.session.item_id

    // Find the item
    const item = await Item.findOne({_id: item_id})

    // Record the provider and item
    req.session.sender_id = req.session.user_id
    req.session.receiver_id = item.user_id
    req.session.action = "book"

    res.render("item.html", {item: item})
}

exports.buffer = async (req, res) => {
    // Record item id
    req.session.item_id = req.params.id

    res.render("buffer.html")
}

// Feature 15: Share a link
// Post: unique_id (item)?
// Finished on the front end
// exports.share = async (req, res) => {
//     console.log(req.body)  // log the request in terminal
// }

// Feature ?: Dynamic rendering for main page
// Post: 6 recommended items on the main page
exports.main = async (req, res) => {
    const dateObject = new Date()
    // Check the expired items
    let all_items = await Item.find({sold_or_expired: false})

    let exp_items = all_items.filter(function (item) {
        let itemTime = new Date(item.exp_date).getTime()
        return itemTime <= dateObject.getTime()
    })

    // Set the sold_or_expired to true
    for(let i = 0; i < exp_items.length; i++){
        await Item.findByIdAndUpdate(exp_items[i]._id, {sold_or_expired: true}, {useFindAndModify: false})
    }

    // Find 6 most recommended items by expiry date
    let items = await Item.find({sold_or_expired: false}).sort({exp_date:1}).limit(6)
    if(req.session.user_id){
        res.render("login.html", {item0: items[0], item1: items[1], item2: items[2], item3: items[3], item4: items[4], item5: items[5]})
    }
    else{
        res.render("main.html", {item0: items[0], item1: items[1], item2: items[2], item3: items[3], item4: items[4], item5: items[5]})
    }
}