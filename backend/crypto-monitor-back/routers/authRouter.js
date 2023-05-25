const Router = require('express').Router
const authController = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = Router()


router.post('/registration', authController.registration)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.get('/activate/:link', authController.activate)
router.get('/refresh', authController.refresh)
router.get('/auth', authController.auth)
router.get('/users', authMiddleware, authController.getUsers)

module.exports = router