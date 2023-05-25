const ApiError = require("../exceptions/apiError")

module.exports = function (err, req, res, next) {
    if (err instanceof ApiError) {
        console.log(err.message)
        return res.status(err.status).json({message: err.message, errors: err.errors})
    }
    console.log(err)
    return res.status(500).json({message: 'Unknown error'})
}