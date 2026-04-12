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
	getTestMaxPoints,
} = require('../controllers/testController')
const router = express.Router()
const authMiddleware = require('../middleware/auth')

// Сначала «жёсткие» пути, потом /:id — иначе Express может перепутать сегменты
router.post('/createTest', authMiddleware, createTest)

router.get('/code/:code', getTestByCode)
router.get('/user/:userId', getUserTests)
router.get('/:testId/rating', getTestRaitings)
router.get('/:testId/stat', getWhoPassedTest)
router.get('/:testId/maxPoints', getTestMaxPoints)

router.get('/:id', getTestById)

router.put('/:id', authMiddleware, updateTest)
router.delete('/:id', authMiddleware, deleteTest)

module.exports = router
