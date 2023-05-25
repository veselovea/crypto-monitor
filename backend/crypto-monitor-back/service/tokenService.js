const jwt = require('jsonwebtoken')
const TokenSchema = require('../models/tokenModel')

class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn:'1d'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn:'30d'})
        return {
            accessToken, 
            refreshToken
        }
    }

    async saveToken(user, userAgent, refreshToken) {
        const tokenData = await TokenSchema.findOne({ where: { UserName: user.name, userAgent } })
        if (tokenData) {
            return await TokenSchema.update({ refreshToken }, { where: { refreshToken: tokenData.refreshToken } })
        }
        const token = await TokenSchema.create({ refreshToken, userAgent, UserName: user.name })
        return token
    }

    async removeToken(refreshToken) {
        const tokenData = await TokenSchema.findByPk(refreshToken)
        return await tokenData.destroy()
    }

    async validateAccessToken(token) {
        try {
            const userData = await jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            return userData
        } catch (e) {
            return null
        }
    }

    async validateRefreshToken(token) {
        try {
            const userData = await jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            return userData
        } catch (e) {
            return null
        }
    }

    async findToken(refreshToken) {
        const tokenData = await TokenSchema.findByPk(refreshToken)
        return tokenData
    }
}

module.exports = new TokenService()