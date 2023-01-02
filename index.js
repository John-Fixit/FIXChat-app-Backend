const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser')
const userRouter = require('./Routes/userRoute')
const messageRouter = require('./Routes/messagesRoute')
const mongoose = require('mongoose')
const socket = require('socket.io')
app.use(bodyParser.urlencoded({extended: true, limit: true}))
app.use(bodyParser.json())
app.use(cors())
const MONGODB_URL = process.env.MONGODB_URL
mongoose.connect(MONGODB_URL, (err)=>{
    if(err){
        console.log(`mongoDB not connect`);
    }else{
        console.log(`MongoDB connected`);
    }
})
app.use('/auth', userRouter)
app.use('/message', messageRouter)
const PORT = process.env.PORT
const server = app.listen(PORT || 5000, ()=>{
    console.log(`app is listening on port: ${PORT}`);
})

const io = socket(server, {cors: {origin : "*"}})

global.onlineUsers = new Map();

io.on("connection", (socket)=>{
    global.chatSocket = socket;

    socket.on("add-user", (userId)=>{
        onlineUsers.set(userId, socket.id)
    })

    socket.on("send-msg", (data)=>{
        const sendUserSocket = onlineUsers.get(data.to)
        console.log(data);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("msg-recieve", {msg:data.msg, time: data.time})
        }
    })
})