// backend/routes/results.js
const express = require('express')
const router = express.Router()
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

// Сохранить результат прохождения теста
router.post('/', authMiddleware, async (req, res) => {
   try {
      const { testId, score } = req.body
      const userId = req.userId

      if (!testId || score === undefined) {
         return res.status(400).json({ error: 'Требуется testId и score' })
      }

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
            existingResult.completedAt = new Date()
            await user.save()
         }
      } else {
         // Добавляем новый результат
         user.myPassedTests.push({ testId, score })
         await user.save()
      }

      res.json({ success: true, message: 'Результат сохранён' })
   } catch (error) {
      console.error('Ошибка сохранения результата:', error)
      res.status(500).json({ error: 'Ошибка сервера' })
   }
})

module.exports = router
