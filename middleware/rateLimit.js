const { authRateLimiter } = require("../config/rateLimiter.js")

const rateLimit = (limiter) => {
    return async (req, res, next) => {
        // Use IP address as the identity being limited
        const identifier = req.ip

        const { success, limit, remaining, reset } = await limiter.limit(identifier)

        if (!success) {
            const secondsToWait = Math.ceil((reset - Date.now()) / 1000)
            return res.status(429).json({
                message: `Too many requests, please try again later in ${secondsToWait} seconds`
            })
        }

        next()
    }
}

module.exports = rateLimit