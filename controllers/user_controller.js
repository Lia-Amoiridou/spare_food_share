// Control interaction with user data only

////////////////
// Components //
////////////////

// Get modules
const mongoose = require('mongoose')  // database
const nodemailer = require('nodemailer')  // email verification
const jwt = require('jsonwebtoken')  // email verification
const crypto = require('crypto')  // data encryption

// Get data model
const User = require('../models/user.js')

// Create Gmail transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'agnecstest@gmail.com',
        pass: 'zuawrtuupctnhdoq'
    }
})

// Define encryption algorithm
const algorithm = 'aes-256-cbc'
// Define the secret key for symmetric encryption
const key = '5370617265466f6f6453686172655370'

///////////////
// Functions //
///////////////

// Generate email verification token
function generateVerificationToken(_id){
    return jwt.sign(
        {ID: _id},
        'secret',
        {expiresIn:'7d'}
    )
}

// Send a verification email
function sendVerificationMail(_id, email){
    // Generate a verification token
    const verificationToken = generateVerificationToken(_id)

    // Define an email verification page
    const url = `http://localhost:3000/verify/${verificationToken}`

    // Send a verification email
    transporter.sendMail({
        from: 'agnecstest@gmail.com',  // admin
        to: email,
        subject: `SpareFoodShare: Verify Account`,
        html: `Click <a href = '${url}'>here</a> to confirm your email.`
    })
}

// Encrypt the plain text
function encrypt(text,iv=crypto.randomBytes(16)) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])

    return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") }
}

// Decrypt the hashed text
function decrypt(IV,hashed_text) {
    let iv = Buffer.from(IV, "hex")
    let encryptedText = Buffer.from(hashed_text, "hex")
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString()
}


//////////////
// Features //
//////////////

// Feature 1: Register
// Post data: username, password, confirm password, email address
exports.register = async (req, res) => {
    // console.log(req.body)  // log the request in terminal\
    const info = req.body  // request information

    if(!info.email || !info.username || !info.password || !info.passwordConf){
        res.send("Register failed: certain info is blank!")
    }
    else{
        if(info.password == info.passwordConf){
            // Search by email address
            User.findOne({email: info.email}, async function(err,data){
                if(!data){
                    // Data encryption (for password and phone number)
                    const encryption = encrypt(info.password)
                    const iv = encryption.iv  // one iv for one data
                    const hashed_password = encryption.encryptedData
                    // const hashed_phone = encrypt(info.phone, Buffer.from(iv, 'hex')).encryptedData

                    // Add a new user data
                    const newUser = await new User({
                        _id: new mongoose.Types.ObjectId(),  // primary key
                        email: info.email,
                        username: info.username,
                        password: hashed_password,
                        // phone: 110, //hashed_phone (front-end loss)
                        iv: iv
                    }).save()

                    // Send a verification email (To be clicked & verified)
                    sendVerificationMail(newUser._id, newUser.email)

                    res.render("hint.html", {response: "Register succeeded! We have sent a verification email. Please check your mail box!\n"})
                }
                else{
                    res.render("hint.html", {response: "Register failed: this email is already used!\n"})
                }
            })
        }
        else{
            res.render("hint.html", {response: "Register failed: passwords are not matched!\n"})
        }
    }
}

// Feature 1: Login
// Post data: email address, password
exports.login = async (req, res) => {
    // console.log(req.body)  // log the request in terminal
    const info = req.body  // // request information

    // Search by email address
    User.findOne({email: info.email}, function(err, data){
        if(data){
            // Decrypt the hashed password
            const password = decrypt(data.iv, data.password)

            // Compare the passwords
            if(password == info.password){
                if(data.verified){
                    req.session.user_id = data._id
                    req.session.user_email = data.email
                    req.session.user_name = data.username
                    req.session.user_type = data.type

                    if(req.session.user_type==="admin"){
                        res.render("hint.html", {response: "Dear admin, welcome back!\n"})
                    }
                    else{
                        res.render("hint.html", {response: "Login succeed!\n"})
                    }
                }
                else{
                    res.render("hint.html", {response: "Login failed: this account is not verified!\n"})
                }
            }
            else {
                // res.redirect("/")
                res.render("hint.html", {response: "Login failed: this password is wrong!\n"})
            }
        }
        else{
            // res.redirect("/")
            res.render("hint.html", {response: "Login failed: this email address is not registered!\n"})
        }
    })
}

// Feature 1: Logout
exports.logout = async (req, res) => {
    req.session.destroy()  // for demo
    res.redirect("/")  // redirect to main page
}


// Feature 2: Verify email
// Post data: email address?
exports.verify = async (req, res) => {
    // console.log(req.params.id)  // log the request in terminal
    const token  = req.params.id  // request information (token)

    if (!token){
        return res.send("Verification failed: missing token!")
    }

    // Verify the token from the URL
    let payload = null
    try{
        payload = jwt.verify(
            token,
            'secret'
        )
    } catch (err) {
        return res.send(err)
    }

    // console.log(payload)

    try{
        // Find user with matching ID
        const user = await User.findOne({_id: payload.ID}).exec()
        if(!user){
            res.render("hint.html", {response: "Verification failed: user does not exists!\n"})
        }

        // Update user verification status to true
        user.verified = true
        res.render("hint.html", {response: "Verification succeeded!\n"})

        return user.save()
    } catch(err) {
        return res.send(err)
    }
}