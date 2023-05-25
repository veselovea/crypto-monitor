const ApiError = require("../exceptions/apiError")
const CoolerSchema = require("../models/coolerModel")
const DeviceSchema = require("../models/deviceModel")
const DeviceStatusSchema = require("../models/deviceStatusModel")
const PlatSchema = require("../models/platModel")
const PlatTempSchema = require("../models/platTempModel")
const PoolSchema = require("../models/poolModel")
const TempDictSchema = require("../models/tempDictModel")
const db = require("../db")

class DeviceService {
    async stats() {
        const stats = {
            summary: 104,
            filters: [
                { name: 'online', amount: 68 },
                { name: 'warning', amount: 12 },
                { name: 'error', amount: 4 },
                { name: 'offline', amount: 17 },
                { name: 'notConfigured', amount: 3 }
            ]
        }
        return stats
    }

    async getAll() {

    }

    async getByID(id) {

    }

    async add(data) {
        const isDevice = data['IsDevice']
        if (!isDevice) {
            throw ApiError.InvalidData()
        }

        let device = await DeviceSchema.findByPk(data['Mac'])
        if (!device) {
            device = await DeviceSchema.create({
                mac: data['Mac'],
                model: data['Model'],
                rateIdeal: data['RateIdeal'],
                rateUnit: data['RateUnit'],
                compaileTime: data['CompileTime']
            })
        }
        const dataStatus = data['Status']
        const deviceStatus = await DeviceStatusSchema.create({
            ip: dataStatus['Ip'],
            elapsed: dataStatus['Elapsed'],
            ghs5s: dataStatus['Ghs5s'],
            ghsAvg: dataStatus['GhsAvg'],
            errors: dataStatus['Errors'],

            DeviceMac: device.mac
        })

        const dataPools = dataStatus['Pools']
        dataPools.forEach(async (pool) => {
            await PoolSchema.create({
                poolNum: pool['PoolNum'],
                url: pool['Url'],
                status: pool['Status'],
                workerName: pool['WorkerName'],

                DeviceStatusId: deviceStatus.id
            })
        });

        const dataCoolers = dataStatus['Coolers']
        dataCoolers.forEach(async (cooler) => {
            await CoolerSchema.create({
                coolerNum: cooler['CoolerNum'],
                speed: cooler['Speed'],

                DeviceStatusId: deviceStatus.id
            })
        })

        const dataPlats = dataStatus['Plats']
        dataPlats.forEach(async (dataPlat) => {
            const plat = await PlatSchema.create({
                platNum: dataPlat['PlatNum'],
                chipCount: dataPlat['ChipCount'],
                rate: dataPlat['Rate'],
                rateIdeal: dataPlat['RateIdeal'],

                DeviceStatusId: deviceStatus.id
            })

            const platTemps = dataPlat['PlatTemps']
            platTemps.forEach(async (dataTemp) => {
                await TempDictSchema.findOrCreate({
                    where: {
                        name: dataTemp['TempName'],
                        prefix: dataTemp['Prefix']
                    }
                }).then(async (temp) => {
                    await PlatTempSchema.create({
                        value: dataTemp['Value'],

                        PlatId: plat.id,
                        TempDictId: temp[0].id
                    })
                })
            })
        })
    }

}

module.exports = new DeviceService()