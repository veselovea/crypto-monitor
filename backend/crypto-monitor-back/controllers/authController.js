const ApiError = require('../exceptions/apiError')
const AuthService = require('../service/authService')

class AuthController {
    async registration(req, res, next) {
        try {
            const { name, password } = req.body
            const userAgent = req.headers['user-agent']
            const userData = await AuthService.registration(name, userAgent, password)

            AuthController.setCookie(res, userData.refreshToken)
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async login(req, res, next) {
        try {
            const { name, password } = req.body
            const userAgent = req.headers['user-agent']
            const userData = await AuthService.login(name, userAgent, password)

            AuthController.setCookie(res, userData.refreshToken)
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies
            const token = await AuthService.logout(refreshToken)
            res.clearCookie('refreshToken')
            return res.json(token)
        } catch (e) {
            next(e)
        }
    }

    async activate(req, res, next) {
        try {

        } catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies
            const userAgent = req.headers['user-agent']
            const userData = await AuthService.refresh(userAgent, refreshToken)

            AuthController.setCookie(res, userData.refreshToken)
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async auth(req, res, next) {
        try {
            const authorizationHeader = req.headers['authorization']
            if (!authorizationHeader) {
                throw ApiError.UnauthorizedError()
            }
            const userData = await AuthService.refreshWithoutToken(authorizationHeader.split(' ')[1])
            if (!userData) {
                throw ApiError.UnauthorizedError('You are have not refreshToken and your accessToken is outdated')
            }
            return res.status(202).json(userData)
        } catch (e) {
            next(e)
        }
    }

    async getUsers(req, res, next) {
        try {
            res.json(await AuthService.getAllUsers())
        } catch (e) {
            next(e)
        }
    }

    static setCookie(res, data) {
        res.cookie('refreshToken', data, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: "None" })
    }
}

module.exports = new AuthController()