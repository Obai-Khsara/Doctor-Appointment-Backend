const mongoose = require("mongoose")

const DoctorSchema = new mongoose.Schema({
    name: String,
    speciality: String,
    image: String,
    description: String,
    experienceYears: Number
})

const Doctor = mongoose.model("Doctor", DoctorSchema)


module.exports = Doctor