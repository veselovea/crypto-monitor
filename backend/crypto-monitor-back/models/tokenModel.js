const { DataTypes } = require("sequelize")
const db = require('../db')

const TokenSchema = db.define(
    'Token',
    {
        refreshToken: { type: DataTypes.STRING, primaryKey: true, unique: true, allowNull: false },
        userAgent: { type: DataTypes.STRING, allowNull: false }
    }, 
    { timestamps: false }
)

module.exports = TokenSchema