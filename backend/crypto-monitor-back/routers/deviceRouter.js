const Router = require('express').Router
const deviceController = require('../controllers/deviceController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = Router()

router.use(authMiddleware)

router.post('/add', deviceController.add)
router.get('/stats', deviceController.stats)
router.get('/getAll', deviceController.getAll)
router.get('/get/:id', deviceController.getByID)


module.exports = router