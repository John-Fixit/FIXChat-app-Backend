const mongoose = require('mongoose')
const messagesSchema = new mongoose.Schema(
    {
        message: {
            text: {
                type: String,
                required: true
            }
        },
        users: Array,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    },
    {
        timestamps: true
    }
    
  )


const messagesModel = mongoose.model('messages_tb', messagesSchema)

module.exports = {messagesModel}