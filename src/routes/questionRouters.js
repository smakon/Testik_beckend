const express = require('express')
const { createQuestion, getAllTestQuestions, deleteQuestionInTest } = require('../controllers/questionController')
const router = express.Router()


// Создать вопрос и добавить в тест
router.post('/', createQuestion)

// Получить все вопросы теста
router.get('/test/:testId', getAllTestQuestions)

// Удалить вопрос из теста
router.delete('/:id', deleteQuestionInTest)

module.exports = router
