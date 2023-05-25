const { DataTypes } = require("sequelize")
const db = require('../db')

const DeviceAPIExceptionSchema = db.define(
    'DeviceAPIException',
    {
        
    },
    { 
        timestamps: true,
        createdAt: true,
        updatedAt: false
    }
)

module.exports = DeviceAPIExceptionSchema