const express = require('express')
const {
	createTest,
	getTestById,
	updateTest,
	deleteTest,
	getUserTests,
	getTestRaitings,
   getTestByCode,
   getWhoPassedTest,
   getTestMaxPoints
} = require('../controllers/testController')
const router = express.Router()
const authMiddleware = require('../middleware/auth')

// Создать новый тест
router.post('/createTest', authMiddleware, createTest)

// Получить тест по ID
router.get('/:id', getTestById)

router.get('/user/:userId', getUserTests)

// Обновить тест
router.put('/:id', authMiddleware, updateTest)

// Удалить тест
router.delete('/:id', authMiddleware, deleteTest)

router.get('/:testId/rating', getTestRaitings)

router.get('/code/:code', getTestByCode)

router.get('/:testId/stat', getWhoPassedTest)

router.get('/:testId/maxPoints', getTestMaxPoints)
module.exports = router
