// Get data from the server (e.g., URL)

// Create a router
const express = require("express")
const router = express.Router()

// Get system controller
const SystemController = require("../controllers/system_controller")

// Route to Home Page
router.get("/", SystemController.main)

// Route to Register Page (UC: Register)
router.get("/register", (req, res, next) => {
    res.render("register.html")
})

// Route to Home Page (after login)
// router.get("/login", (req, res, next) => {
//     res.render("login.html")
// })

router.get("/logout", SystemController.logout)

// Route to Email Verification
router.get('/verify/:id', SystemController.verify)

// Route to Item Page (View a food item)
router.get("/item", SystemController.view)

// Route to Chat Page (Chat with the provider)
router.get("/chat", SystemController.chat)

// Route to List Page (List a food item)
router.get("/list", (req, res, next) => {
    res.render("list.html")
})

// Route to Book Page (Book a collection)
router.get("/book", (req, res, next) => {
    res.render("book.html")
})

// Here are vision pages: about, help & legal
// Route to About Page (Donate)
router.get("/about", (req, res, next) => {
    res.render("about.html")
})

// Route to Help Page (Help)
router.get("/help", (req, res, next) => {
    res.render("help.html")
})

// Route to Legal Page (Legal)
router.get("/legal", (req, res, next) => {
    res.render("legal.html")
})


// Advanced features
// Route to Hint Page (Donate)
router.get("/hint", (req, res, next) => {
    res.render("hint.html")
})

// Route to Admin Page (Admin)
router.get("/admin", (req, res, next) => {
    res.render("admin.html")
})

// Route to Profile page
router.get("/profile", SystemController.profile)

router.get("/template", (req, res, next) => {
    res.render("template.html")
})

router.get("/buffer/:id", SystemController.buffer)

router.get("/payment", (req, res, next) => {
    res.render("payment.html")
})

router.get("/message", SystemController.message)

router.get("/success", SystemController.success)

router.get("/cancel", SystemController.cancel)

// Expose the interface
module.exports = router