const Test = require('../models/Test')
const Question = require('../models/Question')
const User = require('../models/User')
const mongoose = require('mongoose')

const createTest = async (req, res) => {
	try {
		const { title = 'Новый тест', description = '' } = req.body
		const userId = req.userId

		// Генерируем code из временного ObjectId или timestamp
		const tempId = new mongoose.Types.ObjectId()
      const hexPart = tempId.toString()
      
		const decimal = Number(`0x${hexPart}`)
		const first_num = Math.trunc(Number(decimal) / 10 ** 20)
      const second_num = ((Number(decimal) / 10 ** 20) % 1).toFixed(8)
      const random = Math.floor(Math.random() * 9000000)
      console.log(random)
		const code = Math.round((first_num + second_num) / Math.round(random / 125)) 
      
      console.log(code);
		const newTest = new Test({
			title,
			description,
			author: userId,
			code, // ← явно передаём
		})

		await newTest.save()

		// Добавляем в пользователя
		await User.findByIdAndUpdate(userId, {
			$push: { myTests: newTest._id },
		})

		res.status(201).json({ success: true, test: newTest })
	} catch (error) {
		console.error('Ошибка создания теста:', error)
		res.status(500).json({ error: 'Ошибка сервера' })
	}
}

const getTestById = async (req, res) => {
	try {
		const test = await Test.findById(req.params.id)
			.populate('author', 'name')
			.populate('questions')

		if (!test) {
			return res.status(404).json({ error: 'Тест не найден' })
		}

		res.json({ success: true, test })
	} catch (error) {
		res.status(500).json({ error: 'Ошибка получения теста' })
	}
}

const getUserTests = async (req, res) => {
	try {
		const tests = await Test.find({ author: req.params.userId })
			.populate('author', 'name')
			.sort({ createdAt: -1 })

		res.json({ success: true, tests })
	} catch (error) {
		res.status(500).json({ error: 'Ошибка получения тестов пользователя' })
	}
}

const updateTest = async (req, res) => {
	try {
		const { title, maxPoints } = req.body
		const testId = req.params.id

		const test = await Test.findByIdAndUpdate(
			testId,
			{ title, maxPoints, updatedAt: Date.now() },
			{ new: true },
		)

		if (!test) {
			return res.status(404).json({ error: 'Тест не найден' })
		}

		res.json({ success: true, test })
	} catch (error) {
		res.status(500).json({ error: 'Ошибка обновления теста' })
	}
}

const deleteTest = async (req, res) => {
	try {
		const testId = req.params.id
		const userId = req.userId

		const test = await Test.findByIdAndDelete(testId)
		if (!test) {
			return res.status(404).json({ error: 'Тест не найден' })
		}

		// Удаляем тест из массива пользователя
		await User.findByIdAndUpdate(userId, {
			$pull: { myTests: testId },
		})

		// Удаляем связанные вопросы
		await Question.deleteMany({ testId })

		res.json({ success: true, message: 'Тест удален' })
	} catch (error) {
		res.status(500).json({ error: 'Ошибка удаления теста' })
	}
}

const getTestRaitings = async (req, res) => {
	try {
		const { testId } = req.params

		// Получаем всех пользователей, прошедших этот тест
		const users = await User.find(
			{ 'myPassedTests.testId': testId },
			'name myPassedTests',
		).lean()

		// Формируем список результатов
		const results = users.flatMap(user =>
			user.myPassedTests
				.filter(result => result.testId.toString() === testId)
				.map(result => ({
					userId: user._id,
					name: user.name,
					score: result.score,
					completedAt: result.completedAt,
				})),
		)

		// Сортируем по баллам (по убыванию), затем по дате (по возрастанию — кто раньше)
		results.sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score
			return new Date(a.completedAt) - new Date(b.completedAt)
		})

		res.json({ success: true, results })
	} catch (error) {
		console.error('Ошибка получения рейтинга:', error)
		res.status(500).json({ error: 'Ошибка сервера' })
	}
}

const getTestByCode = async (req, res) => {
	try {
		const { code } = req.params

		const test = await Test.findOne({ code })
			.populate('author', 'name')
			.populate('questions')

		if (!test) {
			return res.status(404).json({ error: 'Тест не найден' })
		}

		res.json({ success: true, test })
	} catch (error) {
		console.error('Ошибка поиска теста по code:', error)
		res.status(500).json({ error: 'Ошибка сервера' })
	}
}

const getWhoPassedTest = async (req, res) => {
   try {

      const { testId } = req.params
      const users = await User.find(
         { 'myPassedTests.testId': testId },
         'name myPassedTests',
      )
      res.json({ success: true, users })
   } catch (error) {
      console.error('Ошибка поиска пользователей, прошедших тест:', error)
      res.status(500).json({ error: 'Ошибка сервера' })
   }
}

const getTestMaxPoints = async (req, res) => {
   try {
      const { testId } = req.params
      const test = await Test.findById(testId)
      res.json({ success: true, maxPoints: test.maxPoints })
   } catch (error) {
      console.error('Ошибка поиска максимальных баллов теста:', error)
      res.status(500).json({ error: 'Ошибка сервера' })
   }
}
module.exports = {
	getUserTests,
	createTest,
	getTestById,
	updateTest,
	deleteTest,
   getTestRaitings,
   getTestByCode,
   getWhoPassedTest,
   getTestMaxPoints
}
