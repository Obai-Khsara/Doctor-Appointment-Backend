const validate = (schema, property = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,   // return all errors, not just the first
            stripUnknown: true   // remove fields not defined in schema
        })

        if (error) {
            const errors = error.details.map(detail => detail.message)
            return res.status(400).json({
                message: errors
            })
        }

        req[property] = value // use sanitized/validated data
        next()
    }
}

module.exports = validate