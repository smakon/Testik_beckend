// backend/routes/results.js
const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Test = require('../models/Test')
const Question = require('../models/Question')
const authMiddleware = require('../middleware/auth')

// Сохранить результат прохождения теста
router.post('/', authMiddleware, async (req, res) => {
   try {
      const { testId, score, userAnswers = [] } = req.body
      const userId = req.userId

      if (!testId || score === undefined) {
         return res.status(400).json({ error: 'Требуется testId и score' })
      }

      const normalizedAnswers = Array.isArray(userAnswers)
         ? userAnswers
              .map(item => ({
                 questionId: item?.questionId,
                 answer: item?.answer,
                 awardedPoints:
                    typeof item?.awardedPoints === 'number' && item.awardedPoints > 0
                       ? item.awardedPoints
                       : 0,
              }))
              .filter(
                 item =>
                    item.questionId &&
                    item.answer !== undefined &&
                    item.answer !== null &&
                    (typeof item.answer !== 'string' || item.answer.trim() !== ''),
              )
         : []

      // Находим пользователя
      const user = await User.findById(userId)
      if (!user) {
         return res.status(404).json({ error: 'Пользователь не найден' })
      }

      // Проверяем, проходил ли уже этот тест
      const existingResult = user.myPassedTests.find(r => r.testId.toString() === testId)
      
      if (existingResult) {
         // Обновляем лучший результат (опционально)
         if (score > existingResult.score) {
            existingResult.score = score
         }
         existingResult.userAnswers = normalizedAnswers
         existingResult.completedAt = new Date()
         await user.save()
      } else {
         // Добавляем новый результат
         user.myPassedTests.push({ testId, score, userAnswers: normalizedAnswers })
         await user.save()
      }

      res.json({ success: true, message: 'Результат сохранён' })
   } catch (error) {
      console.error('Ошибка сохранения результата:', error)
      res.status(500).json({ error: 'Ошибка сервера' })
   }
})

// Ручная дооценка текстового ответа автором теста
router.put('/manual-score', authMiddleware, async (req, res) => {
   try {
      const { testId, userId, questionId, delta } = req.body

      if (!testId || !userId || !questionId || !Number.isFinite(delta)) {
         return res
            .status(400)
            .json({ error: 'Требуются testId, userId, questionId и delta' })
      }

      const test = await Test.findById(testId).select('author')
      if (!test) {
         return res.status(404).json({ error: 'Тест не найден' })
      }

      if (test.author.toString() !== req.userId.toString()) {
         return res.status(403).json({ error: 'Нет прав для оценки этого теста' })
      }

      const question = await Question.findOne({
         _id: questionId,
         testId,
      }).select('questionType points')

      if (!question) {
         return res.status(404).json({ error: 'Вопрос не найден' })
      }

      if (question.questionType !== 'text') {
         return res.status(400).json({ error: 'Ручная оценка доступна только для text вопросов' })
      }

      const student = await User.findById(userId)
      if (!student) {
         return res.status(404).json({ error: 'Ученик не найден' })
      }

      const passedTest = student.myPassedTests.find(result => result.testId.toString() === testId)
      if (!passedTest) {
         return res.status(404).json({ error: 'У ученика нет результата по этому тесту' })
      }

      const answer = passedTest.userAnswers.find(
         item => item.questionId && item.questionId.toString() === questionId,
      )
      if (!answer) {
         return res.status(404).json({ error: 'Ответ ученика по этому вопросу не найден' })
      }

      const maxPoints = Number(question.points) || 0
      const currentPoints = Number(answer.awardedPoints) || 0
      const nextPoints = Math.min(Math.max(currentPoints + Number(delta), 0), maxPoints)
      const actualDelta = nextPoints - currentPoints

      if (actualDelta === 0) {
         return res.json({
            success: true,
            score: passedTest.score,
            awardedPoints: currentPoints,
         })
      }

      answer.awardedPoints = nextPoints
      passedTest.score = Math.max((Number(passedTest.score) || 0) + actualDelta, 0)

      await student.save()

      return res.json({
         success: true,
         score: passedTest.score,
         awardedPoints: nextPoints,
      })
   } catch (error) {
      console.error('Ошибка ручной оценки ответа:', error)
      res.status(500).json({ error: 'Ошибка сервера' })
   }
})

module.exports = router
