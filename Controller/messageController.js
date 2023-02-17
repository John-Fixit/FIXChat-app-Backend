const { messagesModel } = require("../Model/MessageModel")

const addMessage=(req, res)=>{
    const {from, to, message} = req.body
    messagesModel.create({
        message: { text: message},
        users: [from, to],
        sender: from
    }, (err, data)=>{
        if(err){
            res.json({message: `internal server error. message not sent`, status: false})
        }
        else{
            res.json({message: `message addded successfully`, status: true})
        }
    })
}


const getallMessage=(req, res)=>{
    const {from, to} = req.body;
    messagesModel.find({
        users:{ $all: [from, to] }
    }, (err, result)=>{
        if(!err){
            const projectMessages = result.map((msg)=>{
                return {
                    fromSelf: msg.sender.toString() === from,
                    message: msg.message.text,
                    time: msg.createdAt.toLocaleTimeString(),
                }

            })
            res.json({projectMessages, status: true})
        }
    })
}

module.exports = {addMessage, getallMessage}