const { DataTypes } = require("sequelize")
const db = require('../db')
const PlatTempSchema = require('./platTempModel')

const TempDictSchema = db.define(
    'TempDict',
    {
        id: { type: DataTypes.TINYINT.UNSIGNED, autoIncrement: true, primaryKey: true, unique: true, allowNull: false  },
        name: { type: DataTypes.STRING(15), allowNull: false },
        prefix: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false }
    },
    { timestamps: false }
)
TempDictSchema.hasMany(PlatTempSchema)

module.exports = TempDictSchema