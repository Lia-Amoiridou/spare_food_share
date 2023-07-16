// Post data to the server (e.g., a request)

// Create a router
const express = require("express")
const router = express.Router()

// Get system controller
const SystemController = require("../controllers/system_controller")

// Send a registration request
router.post('/register', SystemController.register)

// Send a login request
router.post('/login', SystemController.login)

// Send an email verification request
router.post('/verify', SystemController.verify)

// Send a search a food item request
router.post('/search', SystemController.search)

// Send a list a food item request
router.post('/list', SystemController.list)

// Send a donate request
router.post("/donate", SystemController.donate)

// TBD...
router.post('/send', SystemController.send)

// TBD...
router.post('/reply', SystemController.reply)

// TBD...
router.post('/paypal', SystemController.paypal)

// Expose the interface
module.exports = router

