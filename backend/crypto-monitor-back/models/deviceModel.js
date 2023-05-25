const { DataTypes } = require("sequelize")
const db = require('../db')
const DeviceStatusSchema = require("./deviceStatusModel")

const DeviceSchema = db.define(
    'Device',
    {
        mac: { type: DataTypes.STRING(18), primaryKey: true, unique: true, allowNull: false },
        model: { type: DataTypes.STRING(50),  allowNull: false },
        rateIdeal: { type: DataTypes.FLOAT, allowNull: false },
        rateUnit: { type: DataTypes.STRING(10), allowNull: false },
        compaileTime: { type: DataTypes.STRING(40), allowNull: false }
    },
    { timestamps: false }
)
DeviceSchema.hasMany(DeviceStatusSchema, { onDelete: 'cascade' })

module.exports = DeviceSchema