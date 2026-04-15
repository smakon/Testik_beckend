const Question = require('../models/Question')
const Test = require('../models/Test')

const createQuestion = async (req, res) => {
	try {
		const {
			question,
			image,
			mimeType,
			answers,
			points = 1,
			questionType = 'multiple_choice',
			testId,
		} = req.body

		// Валидация
		if (!question || question.trim() === '') {
			return res.status(400).json({ error: 'Текст вопроса обязателен' })
		}

		if (!testId) {
			return res.status(400).json({ error: 'ID теста обязателен' })
		}

		const allowedQuestionTypes = ['multiple_choice', 'true_false', 'text']
		if (!allowedQuestionTypes.includes(questionType)) {
			return res.status(400).json({ error: 'Некорректный тип вопроса' })
		}

		const normalizedAnswers = Array.isArray(answers) ? answers : []
		const preparedAnswers = normalizedAnswers
			.map(a => ({
				text: (a?.text || '').trim(),
				isCorrect: Boolean(a?.isCorrect),
			}))
			.filter(a => a.text !== '')

		// Если вариантов нет (или они пустые), автоматически считаем вопрос текстовым
		const effectiveQuestionType =
			questionType === 'text' || preparedAnswers.length === 0
				? 'text'
				: questionType

		if (effectiveQuestionType !== 'text') {
			if (!preparedAnswers.some(a => a.isCorrect)) {
				return res
					.status(400)
					.json({ error: 'Необходимо выбрать правильный ответ' })
			}
		}

		// Проверяем существование теста
		const test = await Test.findById(testId)
		if (!test) {
			return res.status(404).json({ error: 'Тест не найден' })
		}

		// Определяем порядковый номер вопроса
		const order = test.questions.length

		// Создаем вопрос
		const newQuestion = new Question({
			question,
			image: image || null,
			mimeType: mimeType || 'image/png',
			answers: effectiveQuestionType === 'text' ? [] : preparedAnswers,
			points,
			questionType: effectiveQuestionType,
			testId,
			order,
		})

		await newQuestion.save()

		// Добавляем вопрос в тест
		test.questions.push(newQuestion._id)
		await test.save()

		res.status(201).json({
			success: true,
			message: 'Вопрос успешно добавлен в тест',
			question: newQuestion,
		})
	} catch (error) {
		console.error('Ошибка добавления вопроса:', error)
		res.status(500).json({ error: 'Ошибка сервера при добавлении вопроса' })
	}
}

const getAllTestQuestions = async (req, res) => {
   try {
      const questions = await Question.find({ testId: req.params.testId })
         .sort({ order: 1 })
      
      res.json({ success: true, questions })
   } catch (error) {
      res.status(500).json({ error: 'Ошибка получения вопросов' })
   }
}

const deleteQuestionInTest = async (req, res) => {
	try {
		const question = await Question.findByIdAndDelete(req.params.id)
		if (!question) {
			return res.status(404).json({ error: 'Вопрос не найден' })
		}

		// Удаляем вопрос из теста
		await Test.findByIdAndUpdate(question.testId, {
			$pull: { questions: question._id },
		})

		res.json({ success: true, message: 'Вопрос удален' })
	} catch (error) {
		res.status(500).json({ error: 'Ошибка удаления вопроса' })
	}
}

module.exports = { createQuestion, getAllTestQuestions, deleteQuestionInTest }
