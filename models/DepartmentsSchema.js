const mongoose = require("mongoose")

const DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    image: String
})


const Department = mongoose.model("Department", DepartmentSchema)


module.exports = Department