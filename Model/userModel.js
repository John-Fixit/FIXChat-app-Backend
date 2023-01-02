const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 3
    },
    profile_picture: {
        type: String
    }
})

let saltRound = 10;
userSchema.pre('save', function(next){
    bcrypt.hash(this.password, saltRound, (err, hashedPassword)=>{
        if(err){
            console.log(`there's an error`);
        }else{
            this.password = hashedPassword
            next()
        }
    })
})

userSchema.methods.validatePassword = function(password, callback){
    bcrypt.compare(password, this.password, (err, same)=>{
        if(!err){
            callback(err, same)
        }
        else{
            next()
        }
    })
}


const userModel = mongoose.model('users_tb', userSchema)

module.exports = {userModel}