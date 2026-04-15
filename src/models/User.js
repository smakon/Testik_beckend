const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
   name: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   email: { type: String, required: false },
   myTests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
   myPassedTests: [{
      testId: { 
         type: mongoose.Schema.Types.ObjectId, 
         ref: 'Test', 
         required: true 
      },
      score: { 
         type: Number, 
         required: true,
         min: 0 
      },
      userAnswers: [
         {
            questionId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Question',
               required: true,
            },
            // Для тестовых вопросов индекс ответа, для text — строка
            answer: {
               type: mongoose.Schema.Types.Mixed,
               required: true,
            },
            // Ручная дооценка от автора теста (для text вопросов)
            awardedPoints: {
               type: Number,
               default: 0,
               min: 0,
            },
         },
      ],
      completedAt: { 
         type: Date, 
         default: Date.now 
      }
   }]
})

module.exports = mongoose.model('User', userSchema)
