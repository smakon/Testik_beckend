const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
	question: {
		type: String,
		required: true,
		trim: true,
	},
	image: {
		type: String, // base64 без префикса
		default: null,
	},
	mimeType: {
		type: String,
		default: 'image/png',
	},
	answers: [
		{
			text: {
				type: String,
				required: true,
				trim: true,
			},
			isCorrect: {
				type: Boolean,
				default: false,
			},
		},
	],
	points: {
		type: Number,
		default: 1,
		min: 1,
		max: 100,
	},
	questionType: {
		type: String,
		enum: ['multiple_choice', 'true_false', 'text'],
		default: 'multiple_choice',
	},
	testId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Test',
		required: true,
	},
	order: {
		type: Number,
		default: 0,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('Question', questionSchema)
