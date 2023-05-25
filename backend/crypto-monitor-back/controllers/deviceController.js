const ApiError = require("../exceptions/apiError")
const deviceService = require("../service/deviceService")

class DeviceController {
    async stats(req, res, next) {
        try {
            const data = await deviceService.stats()
            res.json(data)
        } catch (e) {
            next(e)
        }
    }

    async getAll(req, res, next) {
        try {
            throw ApiError.NotFound()
        } catch (e) {
            next(e)
        }
    }

    async getByID(req, res, next) {
        try {
            throw ApiError.NotFound()
        } catch (e) {
            next(e)
        }
    }

    async add(req, res, next) {
        try {
            const authorizationHeader = req.headers['authorization']
            if (!authorizationHeader) {
                throw ApiError.UnauthorizedError()
            }
            const data = req.body
            deviceService.add(data)
            res.send("OK")
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new DeviceController()