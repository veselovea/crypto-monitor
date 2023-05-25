const CoolerSchema = require("./models/coolerModel")
const DeviceSchema = require("./models/deviceModel")
const DeviceStatusSchema = require("./models/deviceStatusModel")
const PlatSchema = require("./models/platModel")
const PlatTempSchema = require("./models/platTempModel")
const PoolSchema = require("./models/poolModel")
const TempDictSchema = require("./models/tempDictModel")
const TokenSchema = require("./models/tokenModel")
const UserSchema = require("./models/userModel")

async function init() {
    await UserSchema.sync()
    await DeviceSchema.sync()
    await DeviceStatusSchema.sync()
    await PlatSchema.sync()
    await TempDictSchema.sync()
    await PlatTempSchema.sync()
    await PoolSchema.sync()
    await CoolerSchema.sync()
    await TokenSchema.sync()
}

module.exports = { init }