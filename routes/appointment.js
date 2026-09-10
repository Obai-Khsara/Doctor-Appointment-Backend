const express = require("express")
const router = express.Router()
const Appointment = require("../models/AppointmentSchema.js")
const auth = require("../auth/Middleware.js")



// Create New Appointmnet
router.post("/", auth(), async (req, res) => {
    try {
        const { doctor, date, reason } = req.body

        if (!doctor || !date || !reason) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        const newAppointment = await Appointment.create({
            user: req.user.id,
            doctor,
            date,
            reason
        })

        return res.status(201).json({
            message: "Appointment created successfully",
            newAppointment
        })

    } catch (error) {
        console.log("Error in creating appointment")
        return res.status(500).json({ message: error })
    }
})


// Get My Appointment
router.get("/", auth(), async (req, res) => {
    const appointments = await Appointment.find({ user: req.user.id }).populate("doctor")
    return res.status(200).json({
        message: "Your appointment",
        appointments
    })

})


// Delete Appointment
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params

        const appointment = await Appointment.findByIdAndDelete(id)

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" })
        }

        return res.status(200).json({
            message: "appointment deleted successfully"
        })

    } catch (error) {
        console.log("Error in deleteing appointment")
        return res.status(500).json({ message: error })
    }
})


module.exports = router