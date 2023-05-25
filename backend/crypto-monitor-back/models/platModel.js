const { DataTypes } = require("sequelize")
const db = require('../db')
const PlatTempSchema = require("./platTempModel")

const PlatSchema = db.define(
    'Plat',
    {
        id: { type: DataTypes.UUID, primaryKey: true, unique: true, defaultValue: DataTypes.UUIDV4,  allowNull: false },
        platNum: { type: DataTypes.INTEGER, allowNull: false },
        chipCount: { type: DataTypes.INTEGER, allowNull: false },
        rate: { type: DataTypes.DECIMAL, allowNull: false },
        rateIdeal: { type: DataTypes.DECIMAL, allowNull: true }
    },
    { timestamps: false }
)
PlatSchema.hasMany(PlatTempSchema, { onDelete: 'cascade' })

module.exports = PlatSchema