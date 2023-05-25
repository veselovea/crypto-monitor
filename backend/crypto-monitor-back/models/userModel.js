const { DataTypes } = require("sequelize")
const db = require('../db')
const DeviceSchema = require("./deviceModel")
const TokenSchema = require("./tokenModel")

const UserSchema = db.define(
    'User',
    {
        name: { type: DataTypes.STRING, primaryKey: true, unique: true, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        isActivated: { type: DataTypes.BOOLEAN, defaultValue: false },
        activationLink: { type: DataTypes.STRING }
    },
    {
        timestamps: false
    }
)
UserSchema.hasMany(TokenSchema, { onDelete: 'cascade' })
UserSchema.hasMany(DeviceSchema, { onDelete: 'cascade' })

module.exports = UserSchema