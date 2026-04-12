const path = require('path')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

const userRoutes = require('./routes/userRouters')
const testsRouter = require('./routes/testRouters')
const questionsRouter = require('./routes/questionRouters')
const resultsRouter = require('./routes/result')

const app = express()

app.set('trust proxy', 1)

app.use(cookieParser())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

app.use(
	cors({
		origin: true,
		credentials: true,
	}),
)

app.use('/api/users', userRoutes)
app.use('/api/tests', testsRouter)
app.use('/api/questions', questionsRouter)
app.use('/api/results', resultsRouter)

const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))
app.use((req, res, next) => {
	if (req.path.startsWith('/api')) return next()
	if (req.method !== 'GET' && req.method !== 'HEAD') return next()
	res.sendFile(path.join(distPath, 'index.html'), (err) => (err ? next(err) : undefined))
})

app.use((req, res) => {
	res.status(404).json({ error: 'не найдено' })
})

module.exports = app
