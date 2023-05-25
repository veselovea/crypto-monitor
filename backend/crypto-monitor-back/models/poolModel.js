const { DataTypes } = require("sequelize")
const db = require('../db')

const PoolSchema = db.define(
    'Pool',
    {
        poolNum: { type: DataTypes.INTEGER, allowNull: false },
        url: { type: DataTypes.STRING(100), allowNull: false },
        status: { type: DataTypes.STRING(10), allowNull: false },
        workerName: { type: DataTypes.STRING(50), allowNull: false }
    },
    { timestamps: false, noPrimaryKey: true }
)

module.exports = PoolSchema