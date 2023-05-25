const { DataTypes } = require("sequelize")
const db = require('../db')
const CoolerSchema = require("./coolerModel")
const PlatSchema = require("./platModel")
const PoolSchema = require("./poolModel")

const DeviceStatusSchema = db.define(
    'DeviceStatus',
    {
        id: { type: DataTypes.UUID, primaryKey: true, unique: true, defaultValue: DataTypes.UUIDV4,  allowNull: false },
        ip: { type: DataTypes.STRING(15), allowNull: false  },
        elapsed: { type: DataTypes.INTEGER, allowNull: false },
        ghs5s: { type: DataTypes.FLOAT, allowNull: false },
        ghsAvg: { type: DataTypes.FLOAT, allowNull: false },
        errors: { type: DataTypes.INTEGER, allowNull: false }
    },
    {
        timestamps: true,
        createdAt: true,
        updatedAt: false
    }
)
DeviceStatusSchema.hasMany(PoolSchema, { onDelete: 'cascade' })
DeviceStatusSchema.hasMany(PlatSchema, { onDelete: 'cascade' })
DeviceStatusSchema.hasMany(CoolerSchema, { onDelete: 'cascade' })

module.exports = DeviceStatusSchema