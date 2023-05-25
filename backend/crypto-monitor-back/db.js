const Sequelize = require('sequelize')
const sequelize = new Sequelize(
    'nodebase',
    'nodeserver',
    'nodeserverdbconnection',
    {
        dialect: 'mssql',
        logging: false,
    }
)

module.exports = sequelize