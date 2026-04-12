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

if (process.env.NODE_ENV === 'production') {
	app.set('trust proxy', 1)
}

app.use(cookieParser())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
	.split(',')
	.map((s) => s.trim())
	.filter(Boolean)

app.use(
	cors({
		origin: clientOrigins.length === 1 ? clientOrigins[0] : clientOrigins,
		credentials: true,
	}),
)

// --- API (всегда под префиксом /api) ---
app.use('/api/users', userRoutes)
app.use('/api/tests', testsRouter)
app.use('/api/questions', questionsRouter)
app.use('/api/results', resultsRouter)

// --- Фронт в продакшене: статика из backend/dist (собирается Vite’ом, можно коммитить в git) ---
const distPath = path.join(__dirname, '../dist')
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(distPath))
	app.use((req, res, next) => {
		if (req.path.startsWith('/api')) return next()
		if (req.method !== 'GET' && req.method !== 'HEAD') return next()
		res.sendFile(path.join(distPath, 'index.html'), (err) => (err ? next(err) : undefined))
	})
} else {
	app.get('/', (req, res) => {
		res.type('html').send(
			'<p>API работает. Фронт запускайте отдельно: <code>cd frontend && npm run dev</code></p>',
		)
	})
}

app.use((req, res) => {
	res.status(404).json({ error: 'не найдено' })
})

module.exports = app
