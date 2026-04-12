require('dotenv').config()
const app = require('./src/app')
const connectDB = require('./src/models/connection')

const PORT = process.env.PORT

connectDB().then(() => {
	app.listen(PORT, () => {
		console.log(`🚀 Сервер запущен на порту ${PORT}`)
	})
})
