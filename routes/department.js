const express = require("express")
const router = express.Router()
const Department = require("../models/DepartmentsSchema.js")
const multer = require("multer")
const auth = require("../auth/Middleware.js")
const path = require("path")
const redisClient = require("../config/redisClient.js")



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
})
const upload = multer({ storage: storage })


//Create New Department
router.post("/", auth("admin"), upload.single("image"), async (req, res) => {
    try {
        const { name, description } = req.body
        const image = req.file ? req.file.filename : null

        if (!name) {
            return res.status(400).json({
                message: "Name of department is required"
            })
        }

        const department = await Department.create({
            name,
            description,
            image: req.file?.filename
        })

        await redisClient.del("departments:all")
        await redisClient.del("departments:count")

        return res.status(201).json(department)

    } catch (error) {
        console.log("Error in create department")
        return res.status(500).json({ message: error })
    }
})


// Get All Departments
router.get("/", async (req, res) => {
    try {

        const cacheKey = "departments:all"
        const cachedData = await redisClient.get(cacheKey)
        if (cachedData) {
            console.log("All departments fetched successfully (from cache)")
            const departments = cachedData
            return res.status(200).json(departments)
        }

        const departments = await Department.find()

        await redisClient.set(cacheKey, departments, { ex: 3600 })

        return res.status(200).json(departments)
    } catch (error) {
        console.log("Error in get all departments api")
        return res.status(500).json({ message: error })
    }
})



// Get Count of Departments
router.get("/count", async (req, res) => {
    try {

        const cacheKey = "departments:count"
        const cachedData = await redisClient.get(cacheKey)
        if (cachedData !== null) {
            console.log("departments count fetched successfully (from cache)")
            return res.status(200).json({ count: cachedData })
        }

        const count = await Department.countDocuments()

        await redisClient.set(cacheKey, count, { ex: 3600 })

        return res.status(200).json({ count })
    } catch (error) {
        console.log("Error in get departments count api")
        return res.status(500).json({ message: error })
    }
})



module.exports = router