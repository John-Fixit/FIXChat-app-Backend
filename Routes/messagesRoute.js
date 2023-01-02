const express = require('express')
const messageController = require('../Controller/messageController')
const messageRouter = express.Router()

messageRouter.post('/addMsg', messageController.addMessage)
messageRouter.post('/getMsg', messageController.getallMessage)
module.exports = messageRouter