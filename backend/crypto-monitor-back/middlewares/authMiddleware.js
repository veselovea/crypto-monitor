const ApiError = require("../exceptions/apiError")
const AuthService = require("../service/authService")
const TokenService = require("../service/tokenService")


module.exports = async function (req, res, next) {
    try {
        const authorizationHeader = req.headers['authorization']
        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError())
        }

        const accessToken = authorizationHeader.split(' ')[1]
        if (!accessToken) {
            return next(ApiError.UnauthorizedError())
        }

        const userData = await TokenService.validateAccessToken(accessToken)
        if (!userData) {
            return next(ApiError.UnauthorizedError())
        }

        const userExist = await AuthService.checkUserExist(userData)
        if (!userExist) {
            return next(ApiError.UnauthorizedError())
        }

        req.user = userData
        next()
    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }    
}