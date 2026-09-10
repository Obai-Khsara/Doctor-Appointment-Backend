const jwt = require("jsonwebtoken")

const auth = (requiredRole = null) => {
    return async (req, res, next) => {
        let token = req.headers['authorization']

        if (!token) {
            return res.status(401).json({
                message: "Access denied , token required"
            })
        }

        token = token.split(" ")[1]
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(400).json({ message: "Invalid token" })
            } else {
                // console.log(decoded)
                req.user = decoded


                if (requiredRole && requiredRole !== decoded.role) {
                    return res.status(403).json({
                        message: "Access denied, insufficient permission"
                    })
                }

                next()
            }
        })
    }
}

module.exports = auth