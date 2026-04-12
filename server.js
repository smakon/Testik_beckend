require('dotenv').config()
const app = require('./src/app')

const PORT = 8080
const HOST = '0.0.0.0'

app.listen(PORT, HOST, () => {
	console.log(`Server listening on http://${HOST}:${PORT}`)
})
