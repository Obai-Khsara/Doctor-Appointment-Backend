const express = require("express")
const router = express.Router()
const User = require("../models/UserSchema.js")
const jwt = require("jsonwebtoken")
const bcryptjs = require("bcryptjs")
const validate = require("../middleware/validate.js")
const { registerSchema, signinSchema } = require("../validators/authValidator.js")
const rateLimit = require("../middleware/rateLimit.js")
const { authRateLimiter } = require("../config/rateLimiter.js")




// Create new User
router.post("/register", rateLimit(authRateLimiter), validate(registerSchema), async (req, res) => {
    try {
        const { name, email, password, role = "user" } = req.body

        // if (!name || !email || !password) {
        //     return res.status(400).json({ message: "All fields are required" })
        // }

        const userExist = await User.findOne({ email })
        if (userExist) {
            return res.status(400).json({ message: "User already exist" })
        }


        const hashedPassword = await bcryptjs.hash(password, 10)

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        })

        let token = jwt.sign({ email, id: newUser._id, role: newUser.role }, process.env.SECRET_KEY, { expiresIn: "1w" })

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        })
    } catch (error) {
        console.log("Error in register new user")
        return res.status(500).json({ message: error })
    }
})


// Login User
router.post("/signin", rateLimit(authRateLimiter), validate(signinSchema), async (req, res) => {

    try {
        const { email, password } = req.body

        // if (!email || !password) {
        //     return res.status(400).json({ message: "Credientials are required" })
        // }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        const match = await bcryptjs.compare(password, user.password)
        if (!match) {
            return res.status(400).json({ message: "Credientials are incorrect" })
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: "1w" })

        return res.status(200).json({
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.log("Error in signin the user")
        return res.status(500).json({ message: error.message })
    }


})


module.exports = router