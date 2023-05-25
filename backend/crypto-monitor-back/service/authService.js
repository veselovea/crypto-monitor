const UserSchema = require('../models/userModel')
const MailService = require('./mailService')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const TokenService = require('./tokenService')
const UserDto = require('../dtos/userDto')
const ApiError = require('../exceptions/apiError')

class AuthService {
    async registration(name, userAgent, password) {
        const candidate = await UserSchema.findOne({ where: {name} })
        if (candidate) {
            throw ApiError.BadRequest(`A user with this name ("${name}") already exists`)
        }

        const hashPassword = await bcrypt.hash(password, 8)
        const activationLink = uuid.v4()

        const user = await UserSchema.create({ name, password: hashPassword, activationLink })
        MailService.sendActivationMail(name, activationLink)
        
        return await this.generateAndSaveToken(new UserDto(user), userAgent)
    }

    async login(name, userAgent, password) {
        const candidate = await UserSchema.findOne({ where: {name} })
        if (!candidate) {
            throw ApiError.BadRequest(`User not found`)
        }
        const isPassEqals = await bcrypt.compare(password, candidate.password)
        if (!isPassEqals) {
            throw ApiError.BadRequest(`Invalid login or password`)
        }

        return await this.generateAndSaveToken(new UserDto(candidate), userAgent)
    }

    async logout(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError()
        }
        return await TokenService.removeToken(refreshToken)
    }

    async refresh(userAgent, refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError()
        }
        const userData = await TokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await TokenService.findToken(refreshToken)
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError()
        }
        const user = await UserSchema.findByPk(userData.id)

        return await this.generateAndSaveToken(new UserDto(user), userAgent)
    }

    async refreshWithoutToken(accessToken) {
        if (!accessToken) {
            throw ApiError.UnauthorizedError()
        }
        const userData = await TokenService.validateAccessToken(accessToken)
        if (!userData) {
            throw ApiError.UnauthorizedError()
        }
        return userData
    }

    async generateAndSaveToken(userDto, userAgent) {
        const tokens = TokenService.generateToken({...userDto})
        await TokenService.saveToken({...userDto}, userAgent, tokens.refreshToken)

        return { ...tokens, user: userDto }
    }

    async checkUserExist(userDto) {
        const user = await UserSchema.findByPk(userDto.name)
        return user ? true : false
    }

    async getAllUsers() {
        return await UserSchema.findAll()
    }
}

module.exports = new AuthService()