require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const db = require('./db')
const dbInit = require('./dbInit')
const authRouter = require('./routers/authRouter')
const deviceRouter = require('./routers/deviceRouter')
const errorMiddleware = require('./middlewares/errorMiddleware')

const PORT = process.env.PORT || 3000
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: [ 'http://192.168.0.19:8080' ],
    credentials: true
}))
app.use(function (req, res, next) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
    next()
})
app.use('/api/devices/', deviceRouter)
app.use('/api/', authRouter)
app.use(errorMiddleware)
app.disable('x-powered-by')

function start() {
    try {
        app.listen(PORT, () => console.log(`Server has been started on port ${PORT}...`))
        db.authenticate()
            .then(async () => {
                console.log('Connected to database')
                //await db.drop()
                //await dbInit.init()
            })
    } catch (e) {
        console.error(e)
    }
}

start()