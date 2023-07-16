// Control interaction with all data

// Maybe highest level exposed to router ?

// Get controller
const ItemController = require('./item_controller')
const UserController = require('./user_controller')

// Get Data Model
const User = require("../models/user")
const Item = require("../models/item")
const Chat = require("../models/chat")
const Donate = require('../models/donate')

// Get Modules
const mongoose = require("mongoose")
const {MongoClient} = require("mongodb")

const paypal = require("paypal-rest-sdk")
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AXkBQRuJAteZ-ceZ-YHIV4XSwdqnhZbyuVtU-pw2AtYFdA-_Z1mQs_aSnBWOKyi2uD2DLhoaadveVUdV',
    'client_secret': 'EJYU7ALflfBCGSdYUQmr6Ar2ULHCh_sAPJy28-tG6bTgYrjgChihC11HvM2fmL3o8i6cRGMkksKf6RM8'
})

// Get middleware
// const upload = require("../middleware/upload")

// Sent user-relevant requests (Only need user data)
exports.register = UserController.register  // Feature 1: Register
exports.login = UserController.login  // Feature 1: Login
exports.logout = UserController.logout  // Feature 1: Logout
exports.verify = UserController.verify  // Feature 2: Verify email


// Sent item-relevant requests (Only need item data)
exports.search = ItemController.search  // Feature ?: Search a food item
exports.view = ItemController.view  // Feature ?: View a food item
exports.buffer = ItemController.buffer  // Buffer area for the item page
exports.main = ItemController.main  // Feature ?: Dynamic rendering


// Sent system-relevant requests (Need all date)
// Feature 4: List a food item
// exports.list = async (req, res, next) => {
//     if(req.session.user_id){
//         res.render("list.html")
//     }
//     else{
//         res.redirect("/register")
//     }
// }

// Feature 4: List a food item
// Post data (User): unique id
// Post data (Item): item_name, description, expired_date, figure, sold_or_expired, location, ...
exports.list = async (req, res, next) => {
    const info = req.body  // request information

    // Extract tags ()
    // const reg = new RegExp(/\b[A-Za-z][A-Za-z]+\b/g)  // g for all strings
    // const tags = info.tags.match(reg)  // array
    let filter_tags = info.tags.toString().split(",")

    const newItem = await new Item({
        _id: new mongoose.Types.ObjectId(),  // primary key
        item_name: info.item_name,
        item_desc: info.item_desc,
        item_url: info.item_url,
        exp_date: info.exp_date,
        tags: filter_tags,  // array
        user_id: req.session.user_id,
        city: "Sheffield",
        // collectedBy: "64521f4e62f02217553195e8"
    }).save()

    res.render("hint.html", {response: "List Succeeded!\n"})
}

// Feature 6: Book a collection (Combined with donate now)
// Post data (User): unique id
// Post data (Item): unique id
// exports.book = async (req, res) => {
//     console.log(req.body)  // log the request in terminal
// }

// Feature 4: Profile
// Get: user_name, user_email
exports.profile = async (req, res) => {
    const user_id = req.session.user_id
    const user_name = req.session.user_name
    const user_email = req.session.user_email
    const user_type = req.session.user_type

    if(user_type==="admin"){
        const items = await Item.find()
        const items_sold = await Item.find({sold_or_expired: true, collectedBy: {"$ne": null}})
        const items_expired = await Item.find({sold_or_expired: true, collectedBy: null})
        const items_stock = await Item.find({sold_or_expired: false})
        const donation = await Donate.aggregate(   [{$group:{_id: "Total", totalAmount: { $sum: "$amount" }}}])

        res.render("admin.html", {
            n_items: items.length,
            n_items_sold: items_sold.length,
            n_items_stock: items_stock.length,
            sum_amount: donation[0].totalAmount,
            items_stock: items_stock,
            items_sold: items_sold,
            items_expired: items_expired
        })
    }
    else{
        // Find all items posted by the user
        const posted_items = await Item.find({user_id: user_id}).sort({exp_date:1})
        // Find all items posted by the user
        const booked_items = await Item.find({collectedBy: user_id}).sort({exp_date:1})

        res.render("profile.html", {
            user_name: user_name,
            user_email: user_email,
            posted_items: posted_items,
            booked_items: booked_items})
    }
}

// Feature 6: Message Box
exports.message = async (req, res) => {
    const user_id = req.session.user_id

    // Find all relevant chats
    const chats = await Chat.find({provider_id: user_id})

    // Filter all chats corresponding to the item id and user id
    let arr_iu = []
    let arr_l = []
    for(let i=0; i<chats.length; i++){
        let tr = chats[i].item_id + chats[i].user_id
        if(!arr_iu.includes(tr)){
            arr_iu.push(tr)
            arr_l.push(chats[i].item_id.length)
        }
    }

    let arr_chats = []
    for(let i=0; i<arr_iu.length; i++){
        let item_id = arr_iu[i].slice(0, arr_l[i])
        let user_id = arr_iu[i].slice(arr_l[i], arr_iu[i].length)

        let item = await Item.findOne({_id: mongoose.Types.ObjectId(item_id)})
        let user = await User.findOne({_id: mongoose.Types.ObjectId(user_id)})

        arr_chats.push({
            item_name: item.item_name,
            user_name: user.username,
            item_id: item_id,
            user_id: user_id
        })
    }

    res.render("message.html", {
        user_name: req.session.user_name,
        user_email: req.session.user_email,
        chats: arr_chats})
}

// Feature 6: Chat
// Get: unique id (user, provider), message
exports.chat = async (req, res) => {
    if(req.session.user_id){
        const chats = await Chat.find({
            user_id: req.session.sender_id,
            provider_id: req.session.receiver_id,
            item_id: req.session.item_id
        })

        res.render("chat.html", {chats: chats, type: "provider", back: "item"})
    }
    else{
        res.render("register.html")
    }
}

// Feature 6: Chat
// Post: unique id (user, provider), message
exports.send = async (req, res) => {
    const content = req.body.content

    if(req.session.action==="book"){  // For user
        const newChat = await new Chat({
            _id: new mongoose.Types.ObjectId(),  // primary key
            user_id: req.session.sender_id,
            provider_id: req.session.receiver_id,
            item_id: req.session.item_id,
            from: req.session.user_name,
            content: content
        }).save()

        const chats = await Chat.find({
            user_id: req.session.sender_id,
            provider_id: req.session.receiver_id,
            item_id: req.session.item_id
        })

        res.render("chat.html", {chats: chats, type: "provider", back: "item"})
    }
    else{  // For provider
        const newChat = await new Chat({
            _id: new mongoose.Types.ObjectId(),  // primary key
            user_id: req.session.receiver_id,
            provider_id: req.session.sender_id,
            item_id: req.session.item_id,
            from: req.session.user_name,
            content: content
        }).save()

        const chats = await Chat.find({
            user_id: req.session.receiver_id,
            provider_id: req.session.sender_id,
            item_id: req.session.item_id
        })

        res.render("chat.html", {chats: chats, type:"user", back: "message"})
    }
}

// Feature 6: Chat
// Post: unique id (user, provider), message
exports.reply = async (req, res) => {
    const info = req.body

    req.session.sender_id = req.session.user_id
    req.session.receiver_id = info.user_id
    req.session.item_id = info.item_id
    req.session.action = "post"

    const chats = await Chat.find({
        provider_id: req.session.user_id,
        user_id: info.user_id, item_id: info.item_id
    })

    res.render("chat.html", {chats: chats, type:"user", back:"message"})
}

// Feature 13: Donate
// Post: user's unique id?
exports.donate = async (req, res) => {
    if(req.session.user_id){
        const donation = +req.body.donation  // String -> Number
        await Item.findByIdAndUpdate(req.session.item_id,
            {sold_or_expired: true, collectedBy: req.session.user_id},
            {useFindAndModify: false})

        if(donation===0){  // Book
            res.render("hint.html", {response: "Book succeed!\n"})
        }
        else{
            const newDonate = await new Donate({
                _id: new mongoose.Types.ObjectId(),  // primary key
                user_id: req.session.user_id,
                amount: donation
            }).save()
            req.session.donation = donation

            res.redirect("/payment")
        }
    }
    else{
        res.redirect("/register")
    }
}

// Feature 13: Paypal
// Post: user's unique id?
exports.paypal = async (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": req.session.user_id,
                    "sku": "001",
                    "price": "1.00",
                    "currency": "GBP",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "GBP",
                "total": "1.00"
            },
            "description": "Hat for the best team ever"
        }]
    };

    paypal.payment.create(create_payment_json, function(error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    })
}

// Feature 13: Paypal
// Post: user's unique id?
exports.success = async (req, res) => {
    const payerId = req.query.PayerID
    const paymentId = req.query.paymentId

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "GBP",
                "total": "1.00"
            }
        }]
    }

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    })

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i = 0;i < payment.links.length;i++){
                if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href);
                }
            }
        }
    })
}

exports.cancel = async (req, res) => {
    res.send('Cancelled')
}

// Feature ?: Display photo
// exports.show = async (req, res) => {
//     try {
//         const dbConfig = module.exports = {
//             url: "mongodb+srv://Agnesia:Agne9227@sparefs.syeuzzs.mongodb.net/",
//             database: "sfs",
//             imgBucket: "prodModel",
//
//         };
//         const url = dbConfig.url;
//         const mongoClient = new MongoClient(url);
//         const baseUrl = "products/";
//
//         await mongoClient.connect();
//         const database = mongoClient.db(dbConfig.database);
//         const images = database.collection(dbConfig.imgBucket + ".files");
//
//         const cursor = images.find({});
//
//         if ((await cursor.count()) === 0) {
//             return res.status(500).send({
//                 message: "No files found!",
//             });
//         }
//
//         let fileInfos = [];
//         await cursor.forEach((doc) => {
//             fileInfos.push({
//                 id: doc._id,
//                 name: doc.filename,
//                 url: baseUrl + doc.filename,
//             });
//         });
//
//         console.log(fileInfos[0])
//         var giveValue = function (url) {
//             return fileInfos[url];
//         };
//         const urls = fileInfos.map(({ url }) => url);
//         console.log(urls)
//
//         return res.status(200).send(fileInfos);
//     } catch (error) {
//         return res.status(500).send({
//             message: error.message,
//         });
//     }
// };
