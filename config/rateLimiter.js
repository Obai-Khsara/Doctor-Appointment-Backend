const { Ratelimit } = require("@upstash/ratelimit")
const redisClient = require("./redisClient.js")

// 5 requests per 120 seconds, per identifier (usually IP)
const authRateLimiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(5, "120 s"),
    prefix: "ratelimit:auth" // keeps these keys separate from your other cache keys
})

module.exports = { authRateLimiter }