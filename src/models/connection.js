const mongoose = require('mongoose')

const connectDB = async () => {
	const uri = process.env.MONGODB_URI
	if (!uri) {
		console.error('❌ В backend/.env задайте MONGODB_URI=... (см. backend/env.example)')
		process.exit(1)
	}
	try {
		await mongoose.connect(uri)
		console.log('✅ MongoDB подключена')
	} catch (err) {
		console.error('❌ Ошибка подключения к MongoDB:', err)
		process.exit(1)
	}
}

module.exports = connectDB
