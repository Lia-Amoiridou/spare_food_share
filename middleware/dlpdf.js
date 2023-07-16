var pdf = require("pdf-creator-node");
var fs = require("fs");
var path = require("path");
const mongoose = require('mongoose')  // database

// Get data model
const Item = require('../models/item.js')


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





async function generatePDF(){
    var users = await Item.find({} ).lean();

    var html = fs.readFileSync(path.join(__dirname, "./template.html"), "utf8");

    var options = {
        format: "A3",
        orientation: "portrait",
        border: "10mm",
    };


    var document = {
        html: html,
        data: {
            users,
        },
        path: "./output.pdf",
        type: "", // "stream" || "buffer" || "" ("" defaults to pdf)
    };

    pdf.create(document, options)
    .then((res) => {
        console.log(res);
    })
    .catch((error) => {
        console.error(error);
    });


}

generatePDF()


// const getValue = async () => {
//     return Item.find({}).then(data => {
//         console.log(data);
//
//     })
//         .catch(error => {
//             console.log(error);
//         })
// }
//
// let re = getValue()



//
// var html = fs.readFileSync(path.join(__dirname, "./template.html"), "utf8");
//
// var options = {
//     format: "A3",
//     orientation: "portrait",
//     border: "10mm",
// };
//
// var users = [
//     {
//         item_name: "test1",
//         age: "26",
//     },
//     {
//         item_name: "test2",
//         age: "26",
//     },
//     {
//         item_name: "test3",
//         age: "26",
//     },
// ];
//
//
// var document = {
//     html: html,
//     data: {
//         users,
//     },
//     path: "./output.pdf",
//     type: "", // "stream" || "buffer" || "" ("" defaults to pdf)
// };
//
// pdf
//     .create(document, options)
//     .then((res) => {
//         console.log(res);
//     })
//     .catch((error) => {
//         console.error(error);
//     });
