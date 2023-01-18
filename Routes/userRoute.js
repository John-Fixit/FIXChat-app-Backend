const express = require('express')
const userController = require('../Controller/userController')
const userRouter = express.Router()

userRouter.post('/register', userController.register)
userRouter.post('/login', userController.login)
userRouter.get('/chatHome', userController.chatHome)
userRouter.get('/allUsers/:id', userController.allUsers)
userRouter.post('/uploadPhoto', userController.uploadPhoto)
userRouter.put("/forgot-password", userController.forgotPassword)
userRouter.put("/reset-password", userController.resetPassword)
module.exports = userRouter