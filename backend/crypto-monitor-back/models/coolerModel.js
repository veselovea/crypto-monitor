const { DataTypes } = require("sequelize")
const db = require('../db')

const CoolerSchema = db.define(
    'Cooler',
    {
        coolerNum: { type: DataTypes.INTEGER, allowNull: false },
        speed: { type: DataTypes.FLOAT, allowNull: false }
    },
    { timestamps: false, noPrimaryKey: true }
)

module.exports = CoolerSchema