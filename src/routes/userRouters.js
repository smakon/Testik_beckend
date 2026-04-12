const express = require('express')
const router = express.Router()
const { getAllUsers, createUser, getUserByEmail, getUserByName, getUserById } = require('../controllers/userController')

router.get('/all', getAllUsers)
router.post('/create', createUser)
router.get('/getUserByEmail', getUserByEmail)
router.get('/getUserByName', getUserByName)
router.get('/getUserById/:id', getUserById)

module.exports = router
