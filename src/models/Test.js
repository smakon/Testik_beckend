const mongoose = require('mongoose')

const testSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, default: 'Новый тест' },
      description: { type: String, default: '' },
      maxPoints: {type: Number, default: 0},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		code: {
			type: String,
			unique: true,
			required: true,
		},
		questions: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Question',
			},
		],
	},
	{
		timestamps: true,
	},
)


module.exports = mongoose.model('Test', testSchema)
