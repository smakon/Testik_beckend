const User = require('../models/User')

const authMiddleware = async (req, res, next) => {
	const userId = req.cookies.token

	if (!userId) {
		return res.status(401).json({ error: 'Не авторизован' })
	}

	// Проверяем, существует ли пользователь
	const user = await User.findById(userId)
	if (!user) {
		return res.status(401).json({ error: 'Пользователь не найден' })
	}

	req.userId = userId
	next()
}

module.exports = authMiddleware
