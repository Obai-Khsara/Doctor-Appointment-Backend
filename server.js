const express = require("express")
const app = express()
require("dotenv").config()
const cors = require("cors")
const connectDB = require("./config/db.js")



app.use(express.json())
app.use(cors())
app.use("/uploads", express.static("uploads"))

app.use("/user", require("./routes/user.js"))
app.use("/doctor", require("./routes/doctor.js"))
app.use("/appointment", require("./routes/appointment.js"))
app.use("/department", require("./routes/department.js"))

app.listen(process.env.PORT || 3000, () => {
    connectDB()
    console.log(`Server is running on  port ${process.env.PORT}`)
})