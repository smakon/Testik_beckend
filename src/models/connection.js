const mongoose = require('mongoose')

const connectDB = async () => {
	try {
		await mongoose.connect('mongodb://gen_user:i%3Ab%3BU3w9kIp)%7Ba@5.42.113.200:27017/default_db?authSource=admin&directConnection=true') // ← никаких опций!
		console.log('✅ MongoDB подключена')
	} catch (err) {
		console.error('❌ Ошибка подключения к MongoDB:', err)
		process.exit(1)
	}
}

module.exports = connectDB
