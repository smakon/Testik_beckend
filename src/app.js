const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const path = require('path')

const userRoutes = require('./routes/userRouters')
const testsRouter = require('./routes/testRouters')
const questionsRouter = require('./routes/questionRouters')
const resultsRouter = require('./routes/result')

const app = express()

app.use(cookieParser())

// Middleware
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(cors())

app.use(express.static(path.join(__dirname, 'dist')))
// Routes
app.use('/api/users', userRoutes)
app.use('/api/tests', testsRouter)
app.use('/api/questions', questionsRouter)
app.use('/api/results', resultsRouter)

app.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})
// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Sorry' });
});

module.exports = app
