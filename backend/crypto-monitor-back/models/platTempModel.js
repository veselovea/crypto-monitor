const { DataTypes } = require("sequelize")
const db = require('../db')

const PlatTempSchema = db.define(
    'PlatTemp',
    {
        value: { type: DataTypes.FLOAT, allowNull: false }
    },
    { timestamps: false, noPrimaryKey: true }
)

module.exports = PlatTempSchema