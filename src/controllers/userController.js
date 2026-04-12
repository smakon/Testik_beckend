const User = require('../models/User')

const getAllUsers = async (req, res) => {
	try {
		const users = await User.find()
		res.json(users)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
}

const createUser = async (req, res) => {
	try {
		const user = new User(req.body)
		await user.save()
		res.json(user)
	} catch (err) {
		res.status(400).json({ error: err.message })
	}
}

// маршрут: GET /api/users/getUserByEmail
const getUserByEmail = async (req, res) => {
	try {
		const { email } = req.query
		const { password } = req.query

		if (!email) {
			return res.json({ error: 'Email обязателен' })
		}

		const user = await User.findOne({ email })
		if (!user) {
			return res.json({ error: 'Пользователь не найден' })
		} else {
			if (String(user.password) !== String(password)) {
				return res.json({ error: 'false_password' })
			} else {
				const { password, ...safeUser } = user.toObject()
				res.json(safeUser)
			}
		}
	} catch (err) {
		res.status(500).json({ error: 'Ошибка сервера: ' + err })
	}
}

// маршрут: GET /api/users/getUserByName
const getUserByName = async (req, res) => {
	try {
		const { name } = req.query
		const { password } = req.query

		if (!name) {
			return res.status(400).json({ error: 'Имя обязателен' })
		}

		const user = await User.findOne({ name })
		if (!user) {
			return res.json({ error: 'Пользователь не найден' })
		} else {
			if (String(user.password) !== String(password)) {
				return res.json({ error: 'false_password' })
			} else {
				const { password, ...safeUser } = user.toObject()
				res.json(safeUser)
			}
		}
	} catch (err) {
		res.status(500).json({ error: 'Ошибка сервера: ' + err })
	}
}

// маршрут: GET /api/users/getUserById/:id
const getUserById = async (req, res) => {
	try {
		const _id = req.params.id

		if (!_id) {
			return res.status(400).json({ error: 'Email обязателен' })
		}

		const user = await User.findOne({ _id })
		if (!user) {
			return res.status(404).json({ error: 'Пользователь не найден' })
		}

		const { password, ...safeUser } = user.toObject()
		res.json(safeUser)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Ошибка сервера' })
	}
}

module.exports = {
	getAllUsers,
	createUser,
	getUserByEmail,
	getUserByName,
	getUserById,
}
