const express = require("express")
const router = express.Router()
const Doctor = require("../models/DoctorSchema.js")
const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary.js")
const redisClient = require("../config/redisClient.js")
const uploadToSupabase = require("../utils/uploadToSupabase.js")


const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: "doctors",
//         allowed_formats: ["jpg", "jpeg", "png", "webp"],
//     },
// })

// const upload = multer({ storage: storage })

// Create New Doctor
router.post("/", upload.single("image"), async (req, res) => {
    try {
        const { name, speciality, description, experienceYears } = req.body
        // const image = req.file ? req.file.path : null

        let imageUrl = null
        if (req.file) {
            imageUrl = await uploadToSupabase(req.file)
        }


        if (!name || !speciality || !description || !experienceYears || !imageUrl) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const newDoctor = await Doctor.create({
            name,
            speciality,
            description,
            experienceYears,
            image: imageUrl
        })

        await redisClient.del("doctors:all")
        await redisClient.del("doctors:count")

        return res.status(201).json({
            message: "New doctor created successfully",
            newDoctor
        })


    } catch (error) {
        console.log("Error in create doctor")
        return res.status(500).json({ message: error })
    }
})


// Get All Doctors
router.get("/", async (req, res) => {
    try {

        const cacheKey = "doctors:all"
        const cachedData = await redisClient.get(cacheKey)
        if (cachedData) {
            return res.status(200).json({
                message: "All doctors fetched successfully (from cache)",
                doctors: cachedData
            })
        }

        const doctors = await Doctor.find()

        await redisClient.set(cacheKey, doctors, { ex: 3600 })

        res.status(200).json({
            message: "All doctors fetch successfully",
            doctors
        })
    } catch (error) {
        console.log("Error in get all doctors")
        return res.status(500).json({ message: error })
    }
})


// Get Count of Doctors
router.get("/count", async (req, res) => {
    try {

        const cacheKey = "doctors:count"
        const cachedData = await redisClient.get(cacheKey)
        if (cachedData) {
            return res.status(200).json({
                message: "Doctors count fetched successfully (from cache)",
                count: cachedData
            })
        }

        const count = await Doctor.countDocuments()

        await redisClient.set(cacheKey, count, { ex: 3600 })

        return res.status(200).json({ count })
    } catch (error) {
        console.log("Error in get doctors count api")
        return res.status(500).json({ message: error })
    }
})


// Get Doctors With Same Speciality
router.get("/byspeciality/:speciality", async (req, res) => {
    try {
        const { speciality } = req.params
        const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const doctors = await Doctor.find({
            speciality: { $regex: new RegExp(escapeRegex(speciality), "i") }
        })

        return res.status(200).json({
            message: "All doctors with same speciality fetched successfully"
            , doctors
        })

    } catch (error) {
        console.log("Error in get doctors by speciality api")
        return res.status(500).json({ message: error.message })
    }
})

// Get Doctor by id
router.get("/:id", async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            })
        }
        res.status(200).json({
            message: "Doctor fetch successfully",
            doctor
        })
    } catch (error) {
        console.log("Error in get doctor info by id ")
        return res.status(500).json({ message: error })
    }
})


module.exports = router



// const express = require("express")
// const router = express.Router()
// const Doctor = require("../models/DoctorSchema.js")
// const multer = require("multer")
// const path = require("path")
// const redisClient = require("../config/redisClient.js")



// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads')
//     },
//     filename: function (req, file, cb) {
//         const ext = path.extname(file.originalname)
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         cb(null, file.fieldname + '-' + uniqueSuffix + ext)
//     }
// })

// const upload = multer({ storage: storage })

// // Create New Doctor
// router.post("/", upload.single("image"), async (req, res) => {
//     try {
//         const { name, speciality, description, experienceYears } = req.body
//         const image = req.file ? req.file.filename : null


//         if (!name || !speciality || !description || !experienceYears || !image) {
//             return res.status(400).json({ message: "All fields are required" })
//         }

//         const newDoctor = await Doctor.create({
//             name,
//             speciality,
//             description,
//             experienceYears,
//             image: req.file?.filename
//         })

//         await redisClient.del("doctors:all")
//         await redisClient.del("doctors:count")

//         return res.status(201).json({
//             message: "New doctor created successfully",
//             newDoctor
//         })


//     } catch (error) {
//         console.log("Error in create doctor")
//         return res.status(500).json({ message: error })
//     }
// })


// // Get All Doctors
// router.get("/", async (req, res) => {
//     try {

//         const cacheKey = "doctors:all"
//         const cachedData = await redisClient.get(cacheKey)
//         if (cachedData) {
//             return res.status(200).json({
//                 message: "All doctors fetched successfully (from cache)",
//                 doctors: cachedData
//             })
//         }

//         const doctors = await Doctor.find()

//         await redisClient.set(cacheKey, doctors, { ex: 3600 })

//         res.status(200).json({
//             message: "All doctors fetch successfully",
//             doctors
//         })
//     } catch (error) {
//         console.log("Error in get all doctors")
//         return res.status(500).json({ message: error })
//     }
// })


// // Get Count of Doctors
// router.get("/count", async (req, res) => {
//     try {

//         const cacheKey = "doctors:count"
//         const cachedData = await redisClient.get(cacheKey)
//         if (cachedData) {
//             return res.status(200).json({
//                 message: "Doctors count fetched successfully (from cache)",
//                 count: cachedData
//             })
//         }

//         const count = await Doctor.countDocuments()

//         await redisClient.set(cacheKey, count, { ex: 3600 })

//         return res.status(200).json({ count })
//     } catch (error) {
//         console.log("Error in get doctors count api")
//         return res.status(500).json({ message: error })
//     }
// })


// // Get Doctors With Same Speciality
// router.get("/byspeciality/:speciality", async (req, res) => {
//     try {
//         const { speciality } = req.params
//         const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
//         // console.log("Searching for Speciality: ", speciality)
//         const doctors = await Doctor.find({
//             speciality: { $regex: new RegExp(escapeRegex(speciality), "i") }
//         })

//         // console.log("Found Doctors", doctors, doctors.length)
//         return res.status(200).json({
//             message: "All doctors with same speciality fetched successfully"
//             , doctors
//         })

//     } catch (error) {
//         console.log("Error in get doctors by speciality api")
//         return res.status(500).json({ message: error.message })
//     }
// })

// // Get Doctor by id
// router.get("/:id", async (req, res) => {
//     try {
//         const doctor = await Doctor.findById(req.params.id)

//         if (!doctor) {
//             return res.status(404).json({
//                 message: "Doctor not found"
//             })
//         }
//         res.status(200).json({
//             message: "Doctor fetch successfully",
//             doctor
//         })
//     } catch (error) {
//         console.log("Error in get doctor info by id ")
//         return res.status(500).json({ message: error })
//     }
// })





// module.exports = router